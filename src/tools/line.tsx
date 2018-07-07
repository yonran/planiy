import { Point2d, point2dsEqual } from "../point";
import { TopState, actionCreators as topActionCreators, LineEntity, ENTITY_TYPE_LINE, TopToolState } from "../topstate";
import { RenderSvgHooks } from "../renderSvg";

import { clientPoint } from "d3-selection"
import * as React from "react";

export interface LineToolState {
    type: "LineToolState"
    firstPoint: Point2d | null
    prevPoint: Point2d | null
    cursor: Point2d | null
}
export const ACTION_LINE_START = "LineStart"
export interface LineStart {type: typeof ACTION_LINE_START, payload: Point2d}
export const ACTION_LINE_CHANGE = "LineChange"
export interface LineChange {type: typeof ACTION_LINE_CHANGE, payload: Point2d}
export const ACTION_LINE_COMMIT = "LineCommit"
export interface LineCommit {type: typeof ACTION_LINE_COMMIT, payload: Point2d}
export const ACTION_LINE_CLOSE = "LineClose"
export interface LineClose {type: typeof ACTION_LINE_CLOSE, payload: null}
export const ACTION_LINE_CANCEL = "LineCancel"
export interface LineCancel {type: typeof ACTION_LINE_CANCEL, payload: null}
export type LineAction = LineStart | LineChange | LineCommit | LineClose | LineCancel
export const actionCreators = {
    lineStart: (point: Point2d): LineStart => ({type: ACTION_LINE_START, payload: point}),
    lineChange: (point: Point2d): LineChange => ({type: ACTION_LINE_CHANGE, payload: point}),
    lineCommit: (point: Point2d): LineCommit => ({type: ACTION_LINE_COMMIT, payload: point}),
    lineClose: (): LineClose => ({type: ACTION_LINE_CLOSE, payload: null}),
    lineCancel: (): LineCancel => ({type: ACTION_LINE_CANCEL, payload: null}),
}

const extractLineToolState = (toolState: TopToolState|null): LineToolState =>
    toolState != null && toolState.type == "LineToolState" ? toolState :
    {
        type: "LineToolState",
        firstPoint: null,
        prevPoint: null,
        cursor: null,
    }

export const renderHooks: RenderSvgHooks =
    {
        cursor: "crosshair",
        renderToolOverlay:  (topState: TopState): JSX.Element => {
            const toolState: LineToolState = extractLineToolState(topState.toolState)
            return <g>
                {toolState.prevPoint != null ? <g>
                    <circle key="startcir" cx={toolState.prevPoint.x} cy={toolState.prevPoint.y} r="2"/>
                </g> : null}
                {toolState.cursor != null ? <g>
                    <circle key="endcir" cx={toolState.cursor.x} cy={toolState.cursor.y} r="2"/>
                </g> : null}
                {toolState.prevPoint != null && toolState.cursor != null ? <g>
                    <line x1={toolState.prevPoint.x}
                        y1={toolState.prevPoint.y}
                        x2={toolState.cursor.x}
                        y2={toolState.cursor.y}
                        strokeWidth="1"
                        stroke="black"
                    />
                </g> : null}
            </g>
        },
        svgMouseDown: (actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            if (e.buttons != 1)
                return
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineStart({x, y})
            e.preventDefault()  // prevent input from losing focus
        },
        svgMouseMove: (actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineChange({x, y})
        },
        svgMouseUp: (actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineCommit({x, y})
        },
        keyPress: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Enter") {
                if (input.value == "c") {
                    actionCreators.lineClose()
                }
                input.value = ""
                e.preventDefault()
            }
        },
        keyDown: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Escape") {
                actionCreators.lineCancel()
                input.value = ""
                e.preventDefault()
            }
        },
    }

export const reducer = (state: TopState, action: LineAction) => {
    switch (action.type) {
        case ACTION_LINE_COMMIT: {
            const oldToolState: LineToolState = extractLineToolState(state.toolState)
            // const toolState: LineToolState = {...oldToolState, points: [...oldToolState.points, action.payload]}
            const toolState: LineToolState = {...oldToolState,
                firstPoint: oldToolState.firstPoint != null ? oldToolState.firstPoint : action.payload,
                prevPoint: action.payload,
            }
            const line: LineEntity | null = oldToolState.prevPoint == null ? null :
                point2dsEqual(oldToolState.prevPoint, action.payload) ? null :
                {
                    type: ENTITY_TYPE_LINE,
                    start: oldToolState.prevPoint,
                    end: action.payload,
                }
            const entities = line == null ? state.entities : [...state.entities, line]
            return {...state, entities, toolState}
        }
        case ACTION_LINE_CLOSE: {
            const oldToolState: LineToolState = extractLineToolState(state.toolState)
            const toolState: LineToolState = {...oldToolState,
                firstPoint: null,
                prevPoint: null,
                cursor: null,
            }
            const line: LineEntity | null = oldToolState.prevPoint == null ? null :
                oldToolState.firstPoint == null ? null :
                point2dsEqual(oldToolState.prevPoint, oldToolState.firstPoint) ? null :
                {
                    type: ENTITY_TYPE_LINE,
                    start: oldToolState.prevPoint,
                    end: oldToolState.firstPoint,
                }
            const entities = line == null ? state.entities : [...state.entities, line]
            return {...state, entities, toolState}
        }
        case ACTION_LINE_START:
        case ACTION_LINE_CHANGE: {
            const oldToolState: LineToolState = extractLineToolState(state.toolState)
            const toolState: LineToolState = {...oldToolState, cursor: action.payload}
            return {...state, toolState}
        }
        case ACTION_LINE_CANCEL: {
            const oldToolState: LineToolState = extractLineToolState(null)
            const toolState: LineToolState = {...oldToolState, cursor: action.payload}
            return {...state, toolState}
        }
        default: return state
    }
}