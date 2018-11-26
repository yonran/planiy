import { Point2d, point2dsEqual, getSegmentSegmentIntersection, projectPointToLineSegment2d, plus2d, timesscalar2d, minus2d } from "../point";
import { TopState, actionCreators as topActionCreators, TopToolState, ENTITY_TYPE_LINE, Entity, LineEntity } from "../topstate";
import { RenderSvgHooks } from "../renderSvg";

import { clientPoint } from "d3-selection"
import * as React from "react";
import { Snapper, SNAP_POINTS_DISTANCE } from "../snapper";
import { Me_7, parseLengthAndAngle, LengthOrAngle } from "../util/length";

export const TOOL_STATE_TRIM = "TrimToolState"
export interface TrimToolState {
    type: typeof TOOL_STATE_TRIM
    cutSegment: LineEntity | null
}
export const ACTION_TRIM = "Trim"
export interface Trim {type: typeof ACTION_TRIM, payload: {pointSvgCoords: Point2d, hoverOnly: boolean}}
export type TrimAction = Trim
export const actionCreators = {
    trim: (pointSvgCoords: Point2d, hoverOnly: boolean): Trim => ({type: ACTION_TRIM, payload: {pointSvgCoords, hoverOnly}}),
}

const extractTrimToolState = (toolState: TopToolState|null): TrimToolState =>
    toolState != null && toolState.type == TOOL_STATE_TRIM ? toolState :
    {
        type: TOOL_STATE_TRIM,
        cutSegment: null,
    }


const mouseHandler = (snapper: Snapper, actionCreators: typeof topActionCreators) => (e: React.MouseEvent<SVGSVGElement>) => {
    const svgElement: SVGSVGElement = e.currentTarget
    const [x, y] = clientPoint(svgElement, e)
    const pointSvgCoords = {x,y}
    const hoverOnly = e.buttons != 1
    actionCreators.trim(pointSvgCoords, hoverOnly)
    e.preventDefault()  // prevent input from losing focus
}
function renderToolOverlay(topState: TopState): JSX.Element {
    const toolState = extractTrimToolState(topState.toolState)
    if (toolState.cutSegment != null) {
        return <line
            key="trimSegment"
            x1={toolState.cutSegment.start.x * topState.zoom} y1={toolState.cutSegment.start.y * topState.zoom}
            x2={toolState.cutSegment.end.x * topState.zoom} y2={toolState.cutSegment.end.y * topState.zoom}
            strokeWidth="1"
            stroke="red"
            />
    } else {
        return <g/>
    }
}
export const renderHooks: RenderSvgHooks =
    {
        cursor: "crosshair",
        svgMouseDown: mouseHandler,
        svgMouseMove: mouseHandler,
        renderToolOverlay: renderToolOverlay,
    }

const MAX_ALMOST_INTERSECTING_DISTANCE = 1/1024/1024

export function reducer(state: TopState, action: TrimAction): TopState {
    switch (action.type) {
        case ACTION_TRIM:
        {
            const { pointSvgCoords } = action.payload
            const pointDocCoords = {x: pointSvgCoords.x/state.zoom, y: pointSvgCoords.y/state.zoom}
            const maxDistanceDocCoords = SNAP_POINTS_DISTANCE / state.zoom
            const maxDistanceSqDocCoords = maxDistanceDocCoords*maxDistanceDocCoords
            let entityToTrimIndex: number = -1
            let entityToTrim: Entity|null = null
            let bestEntityDistSq: number = Infinity
            let bestEntityT: number = 0
            for (let i = 0; i < state.entities.length; i++) {
                const entity = state.entities[i]
                switch (entity.type) {
                    case ENTITY_TYPE_LINE:
                        const projection = projectPointToLineSegment2d(entity.start, entity.end, pointDocCoords)
                        if (projection.distSq < maxDistanceSqDocCoords && projection.distSq < bestEntityDistSq) {
                            bestEntityDistSq = projection.distSq
                            entityToTrim = entity
                            entityToTrimIndex = i
                            bestEntityT = projection.t
                        }
                        break
                }
            }
            let entities: Entity[]
            let cutSegment: LineEntity | null
            if (entityToTrim != null) {
                // See if it intersects anything
                let t1 = 0, t2 = 1
                for (let i = 0; i < state.entities.length; i++) {
                    if (i == entityToTrimIndex) {
                        continue
                    }
                    const entity = state.entities[i]
                    switch (entity.type) {
                        case ENTITY_TYPE_LINE:
                            const intersectionType = getSegmentSegmentIntersection(
                                entityToTrim.start, entityToTrim.end,
                                entity.start, entity.end,
                                MAX_ALMOST_INTERSECTING_DISTANCE
                            )
                            if (intersectionType.intersect && intersectionType.intersectionIsPoint) {
                                if (intersectionType.t1 < bestEntityT) {
                                    t1 = Math.max(t1, intersectionType.t1)
                                } else {
                                    t2 = Math.min(t2, intersectionType.t2)
                                }
                            }
                            break
                    }
                }
                let replacementSegments: Entity[] = []
                let t1Point: Point2d
                if (t1 > 0) {
                    t1Point = plus2d(entityToTrim.start, timesscalar2d(t1, minus2d(entityToTrim.end, entityToTrim.start)))
                    replacementSegments.push({
                        type: ENTITY_TYPE_LINE,
                        start: entityToTrim.start,
                        end: t1Point,
                    })
                } else {
                    t1Point = entityToTrim.start
                }
                let t2Point: Point2d
                if (t2 < 1) {
                    t2Point = plus2d(entityToTrim.start, timesscalar2d(t2, minus2d(entityToTrim.end, entityToTrim.start)))
                    replacementSegments.push({
                        type: ENTITY_TYPE_LINE,
                        start: t2Point,
                        end: entityToTrim.end,
                    })
                } else {
                    t2Point = entityToTrim.end
                }
                cutSegment = {type: ENTITY_TYPE_LINE, start: t1Point, end: t2Point}
                entities = [
                    ...state.entities.slice(0, entityToTrimIndex),
                    ...replacementSegments,
                    ...state.entities.slice(entityToTrimIndex + 1),
                ]
            } else {
                entities = state.entities
                cutSegment = null
            }
            if (action.payload.hoverOnly) {
                return {...state, toolState: {type: TOOL_STATE_TRIM, cutSegment}}
            } else {
                return {
                    ...state,
                    toolState: {type: TOOL_STATE_TRIM, cutSegment: null},
                    entities,
                }
            }
        }
        default: return state
    }
}