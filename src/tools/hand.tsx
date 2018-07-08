import { Point2d, point2dsEqual } from "../point";
import { TopState, actionCreators as topActionCreators, TopToolState } from "../topstate";
import { RenderSvgHooks } from "../renderSvg";

import { clientPoint } from "d3-selection"
import * as React from "react";
import { Snapper } from "../snapper";
import { Me_7, parseLengthAndAngle, LengthOrAngle } from "../util/length";

export const TOOL_STATE_HAND = "HandToolState"
export interface HandToolState {
    type: typeof TOOL_STATE_HAND
    downPoint: Point2d | null
}
export const ACTION_HAND_START = "HandStart"
export interface HandDown {type: typeof ACTION_HAND_START, payload: Point2d}
export const ACTION_HAND_DRAG = "HandChange"
export interface HandDrag {type: typeof ACTION_HAND_DRAG, payload: Point2d}
export const ACTION_HAND_UP = "HandUp"
export interface HandUp {type: typeof ACTION_HAND_UP, payload: Point2d}
export const ACTION_HAND_ZOOM = "HandZoom"
export interface HandZoom {type: typeof ACTION_HAND_ZOOM, payload: boolean}
export type HandAction = HandDown | HandDrag | HandUp | HandZoom
export const actionCreators = {
    handDown: (point: Point2d): HandDown => ({type: ACTION_HAND_START, payload: point}),
    handDrag: (point: Point2d): HandDrag => ({type: ACTION_HAND_DRAG, payload: point}),
    handUp: (point: Point2d): HandUp => ({type: ACTION_HAND_UP, payload: point}),
    handZoom: (zoomIn: boolean): HandZoom => ({type: ACTION_HAND_ZOOM, payload: zoomIn}),
}

const extractHandToolState = (toolState: TopToolState|null): HandToolState =>
    toolState != null && toolState.type == TOOL_STATE_HAND ? toolState :
    {
        type: TOOL_STATE_HAND,
        downPoint: null,
    }


export const renderHooks: RenderSvgHooks =
    {
        cursor: "grab",
        svgMouseDown: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            if (e.buttons != 1)
                return
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.handDown({x,y})
            e.preventDefault()  // prevent input from losing focus
        },
        svgMouseMove: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            if (e.buttons != 1)
                return
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.handDrag({x,y})
        },
        svgMouseUp: (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
            const svgElement: SVGSVGElement = e.currentTarget
            const [x, y] = clientPoint(svgElement, e)
            actionCreators.handUp({x, y})
        },
        keyPress: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Enter") {
                let lengthOrAngle: LengthOrAngle|null
                if (input.value == "+") {
                    actionCreators.handZoom(true)
                } else if (input.value == "-") {
                    actionCreators.handZoom(false)
                }
                input.value = ""
                e.preventDefault()
            }
        },
        keyDown: (actionCreators: typeof topActionCreators) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input: HTMLInputElement = e.currentTarget
            if (e.key == "Escape") {
                input.value = ""
                e.preventDefault()
            }
        },
    }

export const reducer = (state: TopState, action: HandAction) => {
    switch (action.type) {
        case ACTION_HAND_START: {
            const oldToolState: HandToolState = extractHandToolState(state.toolState)
            const toolState: HandToolState = {...oldToolState,
                downPoint: action.payload
            }
            return {...state, toolState}
        }
        case ACTION_HAND_DRAG: 
        case ACTION_HAND_UP:
        {
            const oldToolState: HandToolState = extractHandToolState(state.toolState)
            let newOrigin: Point2d
            if (oldToolState.downPoint == null) {
                newOrigin = state.origin
            } else {
                const dx = (action.payload.x - oldToolState.downPoint.x)/state.zoom
                const dy = (action.payload.y - oldToolState.downPoint.y)/state.zoom
                newOrigin = {
                    x: state.origin.x - dx,
                    y: state.origin.y - dy,
                }
            }
            return {...state,
                origin: newOrigin
            }
        }
        case ACTION_HAND_ZOOM: {
            return {...state, zoom: state.zoom * (action.payload ? 1.5 : 1/1.5)}
        }
        default: return state
    }
}