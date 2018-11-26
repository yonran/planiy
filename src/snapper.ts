import { TopState, LineEntity, Entity, ENTITY_TYPE_LINE } from "./topstate";
import { Point2d, distSqIfWithinDistance } from "./point";
import { TOOL_STATE_LINE } from "./tools/line";
import { LengthWithUnit, AngleWithUnit } from "./util/length";

interface SnapConstraints {
    point?: Point2d
    distance?: number
    angleDegrees?: number
}

// these are pixels; divide them by state.zoom to get distance in document dimensions
export const SNAP_POINTS_DISTANCE = 10
const SNAP_PROJECTION_DISTANCE = 7
export const snapperGen = (state: TopState) => (pointSvgCoords: Point2d): Point2d => {
    const point = {x: pointSvgCoords.x/state.zoom, y: pointSvgCoords.y/state.zoom}
    let constraintReferencePoint: Point2d|null = null
    let lengthConstraint: LengthWithUnit|null = null
    let angleConstraint: AngleWithUnit|null = null
    if (state.toolState != null) {
        switch (state.toolState.type) {
            case TOOL_STATE_LINE:
                if (state.toolState.prevPoint != null)
                    constraintReferencePoint = state.toolState.prevPoint
                if (state.toolState.lengthConstraint != null && constraintReferencePoint != null)
                    lengthConstraint = state.toolState.lengthConstraint
                if (state.toolState.angleConstraint != null && constraintReferencePoint != null)
                    angleConstraint = state.toolState.angleConstraint
        }
    }
    const lengthMe_7: number|null = lengthConstraint == null ? null : lengthConstraint.length
    const angleDeg: number|null = angleConstraint == null ? null :
        angleConstraint.angle < 0 ? angleConstraint.angle%360+360 :
        angleConstraint.angle
    
    if (lengthMe_7 != null && angleDeg != null) {
        const p: Point2d = constraintReferencePoint!
        switch (angleDeg) {
            case 0: return {x: p.x + lengthMe_7, y: p.y}
            case 90: return {x: p.x - lengthMe_7, y: p.y}
            case 180: return {x: p.x, y: p.y + lengthMe_7}
            case 360: return {x: p.x, y: p.y - lengthMe_7}
            default:
            const rad = angleDeg*(Math.PI/180)
            return {
                x: p.x + lengthMe_7*Math.cos(rad),
                y: p.y + lengthMe_7*Math.sin(rad),
            }
        }
    }

    let bestPoint: Point2d|null = null
    let bestDistsq: number|undefined = undefined
    const pointSnap = (p: Point2d) => {
        const distsq = distSqIfWithinDistance(point, p, SNAP_POINTS_DISTANCE/state.zoom)
        if (distsq != null &&
            (bestPoint == null || bestDistsq != undefined && bestDistsq > distsq)
        ) {
            bestPoint = p
            bestDistsq = distsq
        }
    }
    if (lengthMe_7 == null && angleDeg == null) {
        state.entities.forEach((entity: Entity) => {
            switch (entity.type) {
                case ENTITY_TYPE_LINE:
                    pointSnap(entity.start)
                    pointSnap(entity.end)
            }
        })
    }

    let bestXSnap: number|undefined = undefined
    let bestYSnap: number|undefined = undefined
    const projectSnap = (p: Point2d) => {
        if (Math.abs(p.x - point.x) < SNAP_PROJECTION_DISTANCE/state.zoom &&
            (bestXSnap == undefined || Math.abs(p.x - point.x) < Math.abs(bestXSnap - point.x))
        ) {
            bestXSnap = p.x
        }
        if (Math.abs(p.y - point.y) < SNAP_PROJECTION_DISTANCE/state.zoom &&
            (bestYSnap == undefined || Math.abs(p.y - point.y) < Math.abs(bestYSnap - point.y))
        ) {
            bestYSnap = p.y
        }
    }
    if (lengthMe_7 == null && angleDeg == null) {
        state.entities.forEach((entity: Entity) => {
            switch (entity.type) {
                case ENTITY_TYPE_LINE:
                    projectSnap(entity.start)
                    projectSnap(entity.end)
            }
        })
    }
    const bestProjectSnap: Point2d|null = bestXSnap == undefined && bestYSnap == undefined ? null :
        {
            x: bestXSnap != undefined ? bestXSnap : point.x,
            y: bestYSnap != undefined ? bestYSnap : point.y,
        }

    let refPointSnap: Point2d|null
    if (constraintReferencePoint != null) {
        const dx = point.x - constraintReferencePoint.x
        const dy = point.y - constraintReferencePoint.y
        if (angleDeg != null) {
            const mouseAngle = Math.atan2(dy, dx)
            const mouseDistSq = dx*dx + dy*dy
            const angleRad = angleDeg*(Math.PI/180)
            const newR = Math.sqrt(mouseDistSq) * Math.cos(angleRad - mouseAngle)
            refPointSnap = {
                x: constraintReferencePoint.x + newR * Math.cos(angleRad),
                y: constraintReferencePoint.y + newR * Math.sin(angleRad),
            }
        } else if (Math.abs(dx) < SNAP_PROJECTION_DISTANCE/state.zoom && Math.abs(dx) < Math.abs(dy)) {
            if (lengthMe_7 != null) {
                const isMousePos = point.y > constraintReferencePoint.y
                refPointSnap = {
                    x: constraintReferencePoint.x,
                    y: constraintReferencePoint.y + (isMousePos ? lengthMe_7 : -lengthMe_7),
                }
            } else {
                refPointSnap = {x: constraintReferencePoint.x, y: point.y}
            }
        } else if (Math.abs(dy) < SNAP_PROJECTION_DISTANCE/state.zoom) {
            if (lengthMe_7 != null) {
                const isMousePos = point.x > constraintReferencePoint.x
                refPointSnap = {
                    x: constraintReferencePoint.x + (isMousePos ? lengthMe_7 : -lengthMe_7),
                    y: constraintReferencePoint.y,
                }
            } else {
                refPointSnap = {x: point.x, y: constraintReferencePoint.y}
            }
        } else if (lengthMe_7 != null) {
            const theta = Math.atan2(dy,dx)
            refPointSnap = {
                x: constraintReferencePoint.x + lengthMe_7*Math.cos(theta),
                y: constraintReferencePoint.y + lengthMe_7*Math.sin(theta),
            }
        } else {
            refPointSnap = null
        }
    } else {
        refPointSnap = null
    }

    if (bestPoint != null) {
        return bestPoint
    } else if (refPointSnap != null) {
        return refPointSnap
    } else if (bestProjectSnap != null) {
        return bestProjectSnap
    } else {
        return point
    }
}
export type Snapper = (point2d: Point2d) => Point2d