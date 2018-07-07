import { Point2d } from "../point";
import { TopState, actionCreators as topActionCreators } from "../topstate";
import { RenderSvgHooks } from "../renderSvg";

import { clientPoint } from "d3-selection"
import * as React from "react";

export interface LineToolState {
    type: "LineToolState"
    points: Point2d[]
}
export const ACTION_LINE_START = "LineStart"
export interface LineStart {type: typeof ACTION_LINE_START, payload: Point2d}
export const ACTION_LINE_CHANGE = "LineChange"
export interface LineChange {type: typeof ACTION_LINE_CHANGE, payload: Point2d}
export type LineAction = LineStart | LineChange
export const actionCreators = {
    lineStart: (point: Point2d): LineStart => ({type: ACTION_LINE_START, payload: point}),
    lineChange: (point: Point2d): LineChange => ({type: ACTION_LINE_CHANGE, payload: point}),
}

const extractLineToolState = (state: TopState): LineToolState =>
    state.toolState != null && state.toolState.type == "LineToolState" ? state.toolState :
    {
        type: "LineToolState",
        points: [],
    }

export const renderHooks: RenderSvgHooks =
    {
        cursor: "crosshair",
        renderToolOverlay:  (topState: TopState): JSX.Element => {
            const toolState: LineToolState = extractLineToolState(topState)
            return <g>
                <g>
                    {toolState.points.map((point, i) =>
                        <circle key={i} cx={point.x} cy={point.y} r="2"/>
                    )}
                </g>
                <g>
                    {toolState.points.slice(1).map((point, i) =>
                        <line key={i} x1={toolState.points[i].x}
                        y1={toolState.points[i].y}
                        x2={point.x}
                        y2={point.y}
                        stroke-width="1"
                        stroke="black"
                        />
                    )}
                </g>
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
            if (e.buttons != 1)
                return
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.lineChange({x, y})
        },
        keyPress: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Enter") {
                input.value = ""
                e.preventDefault()
            }
        },
    }

export const reducer = (state: TopState, action: LineAction) => {
    switch (action.type) {
        case ACTION_LINE_START: {
            const oldToolState: LineToolState = extractLineToolState(state)
            const toolState: LineToolState = {...oldToolState, points: [...oldToolState.points, action.payload]}
            return {...state, toolState}
        }
        case ACTION_LINE_CHANGE: {
            const oldToolState: LineToolState = extractLineToolState(state)
            if (oldToolState.points.length == 0) return state
            const toolState: LineToolState = {...oldToolState, points: [...oldToolState.points.slice(0,oldToolState.points.length - 1), action.payload]}
            return {...state, toolState}
        }
        default: return state
    }
}