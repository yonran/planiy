import { Point2d, point2dsEqual } from "../point";
import { TopState, actionCreators as topActionCreators, LineEntity, ENTITY_TYPE_LINE, TopToolState } from "../topstate";
import { RenderSvgHooks } from "../renderSvg";

import { clientPoint } from "d3-selection"
import * as React from "react";
import { Snapper } from "../snapper";
import { LengthWithUnit, parseLength, Me_7, AngleWithUnit, parseLengthAndAngle, LengthOrAngle } from "../util/length";

export const TOOL_STATE_LINE = "LineToolState"
export interface LineToolState {
    type: typeof TOOL_STATE_LINE
    firstPoint: Point2d | null
    prevPoint: Point2d | null
    cursor: Point2d | null
    lengthConstraint: LengthWithUnit | null
    angleConstraint: AngleWithUnit | null
}
export const ACTION_LINE_START = "LineStart"
export interface LineStart {type: typeof ACTION_LINE_START, payload: Point2d}
export const ACTION_LINE_CHANGE = "LineChange"
export interface LineChange {type: typeof ACTION_LINE_CHANGE, payload: Point2d}
export const ACTION_LINE_COMMIT = "LineCommit"
export interface LineCancel {type: typeof ACTION_LINE_CANCEL, payload: null}
export const ACTION_LINE_SET_CONSTRAINT = "LineSetConstraint"
export interface LineSetConstraint {type: typeof ACTION_LINE_SET_CONSTRAINT, payload: LengthOrAngle}
export interface LineCommit {type: typeof ACTION_LINE_COMMIT, payload: Point2d}
export const ACTION_LINE_CLOSE = "LineClose"
export interface LineClose {type: typeof ACTION_LINE_CLOSE, payload: null}
export const ACTION_LINE_CANCEL = "LineCancel"
export type LineAction = LineStart | LineChange | LineCommit | LineSetConstraint | LineClose | LineCancel
export const actionCreators = {
    lineStart: (point: Point2d): LineStart => ({type: ACTION_LINE_START, payload: point}),
    lineChange: (point: Point2d): LineChange => ({type: ACTION_LINE_CHANGE, payload: point}),
    lineCommit: (point: Point2d): LineCommit => ({type: ACTION_LINE_COMMIT, payload: point}),
    lineClose: (): LineClose => ({type: ACTION_LINE_CLOSE, payload: null}),
    lineCancel: (): LineCancel => ({type: ACTION_LINE_CANCEL, payload: null}),
    lineSetConstraint: (lengthOrAngle: LengthOrAngle): LineSetConstraint => ({type: ACTION_LINE_SET_CONSTRAINT, payload: lengthOrAngle}),
}

const extractLineToolState = (toolState: TopToolState|null): LineToolState =>
    toolState != null && toolState.type == TOOL_STATE_LINE ? toolState :
    {
        type: TOOL_STATE_LINE,
        firstPoint: null,
        prevPoint: null,
        cursor: null,
        lengthConstraint: null,
        angleConstraint: null,
    }


export const renderHooks: RenderSvgHooks =
    {
        cursor: "crosshair",
        renderToolOverlay:  (topState: TopState): JSX.Element => {
            const toolState: LineToolState = extractLineToolState(topState.toolState)
            return <g>
                {toolState.prevPoint != null ? <g>
                    <circle key="startcir" cx={toolState.prevPoint.x * topState.zoom} cy={toolState.prevPoint.y * topState.zoom} r="2"/>
                </g> : null}
                {toolState.cursor != null ? <g>
                    <circle key="endcir" cx={toolState.cursor.x * topState.zoom} cy={toolState.cursor.y * topState.zoom} r="2"/>
                </g> : null}
                {toolState.prevPoint != null && toolState.cursor != null ? <g>
                    <line x1={toolState.prevPoint.x * topState.zoom}
                        y1={toolState.prevPoint.y * topState.zoom}
                        x2={toolState.cursor.x * topState.zoom}
                        y2={toolState.cursor.y * topState.zoom}
                        strokeWidth="1"
                        stroke="black"
                    />
                </g> : null}
            </g>
        },
        svgMouseDown: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            if (e.buttons != 1)
                return
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineStart(snapper({x, y}))
            e.preventDefault()  // prevent input from losing focus
        },
        svgMouseMove: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineChange(snapper({x, y}))
        },
        svgMouseUp: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineCommit(snapper({x, y}))
        },
        keyPress: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Enter") {
                let lengthOrAngle: LengthOrAngle|null
                if (input.value == "c") {
                    actionCreators.lineClose()
                } else if (null != (lengthOrAngle = parseLengthAndAngle(input.value, Me_7))) {
                    actionCreators.lineSetConstraint(lengthOrAngle)
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
                angleConstraint: null,
                lengthConstraint: null,
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
        case ACTION_LINE_SET_CONSTRAINT: {
            const oldToolState: LineToolState = extractLineToolState(state.toolState)
            const toolState: LineToolState = {...oldToolState,
                lengthConstraint: action.payload.length == undefined ? oldToolState.lengthConstraint : action.payload.length,
                angleConstraint: action.payload.angle == undefined ? oldToolState.angleConstraint : action.payload.angle,
            }
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