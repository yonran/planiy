export interface Point2d {
    x: number
    y: number
}
export const point2dsEqual = (p1: Point2d, p2: Point2d): boolean =>
    p1.x == p2.x && p1.y == p2.y

export const distSqIfWithinDistance = (p1: Point2d, p2: Point2d, distance: number): number|undefined => {
    if (!(Math.abs(p1.x - p2.x) <= distance &&
        Math.abs(p1.y - p2.y) <= distance)) {
        return undefined
    }
    const distsq = distanceSq2d(p1, p2)
    if (distsq <= distance*distance) {
        return distsq
    } else {
        return undefined
    }
}

const distanceSq2d = (p1: Point2d, p2: Point2d): number => {
    const dx = (p1.x - p2.x)
    const dy = (p1.y - p2.y)
    const distsq = dx*dx + dy*dy
    return distsq
}


// https://stackoverflow.com/a/1501725/471341
interface ClosestPointOnLineSegmentReturn {
    t: number
    closestPointOnSegment: Point2d
    distSq: number
}
export function projectPointToLineSegment2d(start: Point2d, end: Point2d, point: Point2d): ClosestPointOnLineSegmentReturn {
    const lengthsq = distanceSq2d(start, end)
    let t: number
    let segvec: Point2d
    if (lengthsq == 0) {  // degenerate line segment
        segvec = {x: 0, y: 0}
        t = 0
    } else {
        segvec = minus2d(end, start)
        // find the closest t in [0,1] along line segment
        // where the segment is parameterized as line1 + t * (line2-line1)
        t = Math.max(0, Math.min(1, dot2d(minus2d(point, start), segvec)/lengthsq))
    }
    const closestPointOnSegment = plus2d(start, timesscalar2d(t, segvec))
    const distSq = distanceSq2d(closestPointOnSegment, point)
    return {t, closestPointOnSegment, distSq}
}

export const plus2d = (p1: Point2d, p2: Point2d): Point2d => ({x: p1.x + p2.x, y: p1.y + p2.y})
export const minus2d = (p1: Point2d, p2: Point2d): Point2d => ({x: p1.x - p2.x, y: p1.y - p2.y})
const dot2d = (p1: Point2d, p2: Point2d): number =>
    p1.x * p2.x + p1.y * p2.y
export const timesscalar2d = (scalar: number, p: Point2d): Point2d => ({x: scalar * p.x, y: scalar * p.y})
export const plusscalar2d = (scalar: number, p: Point2d): Point2d => ({x: scalar + p.x, y: scalar + p.y})

// returns the z coordinate of the 3d cross product (v1.x, v1.y, 0) × (v2.x, v2.y, 0)
const crossProd2d = (v1: Point2d, v2: Point2d): number => v1.x * v2.y - v1.y * v2.x
// https://stackoverflow.com/a/565282/471341 and https://github.com/pgkelley4/line-segments-intersect/blob/master/js/line-segments-intersect.js
export function getSegmentSegmentIntersection(p: Point2d, p2: Point2d, q: Point2d, q2: Point2d, maxDistSq: number = 0): SegmentSegmentIntersectionType {
    const r = minus2d(p2, p);
    const s = minus2d(q2, q);

    const uNumerator = crossProd2d(minus2d(q, p), r)
    const denominator = crossProd2d(r, s)

    if (uNumerator == 0 && denominator == 0) {
        // They are collinear
        const seg1lengthsq = dot2d(r,r)
        const seg2lengthsq = dot2d(s,s)
        let t1 = dot2d(minus2d(q,  p), r) / seg1lengthsq
        let t2 = dot2d(minus2d(q2, p), r) / seg1lengthsq
        if (t1 < 0 && t2 < 0 || t1 > 1 && t2 > 1 || isNaN(t1)) {
            return {intersect: false}
        }
        t1 = Math.max(0, Math.min(1, t1))
        t2 = Math.max(0, Math.min(1, t2))
        let u1 = dot2d(minus2d(p, q), s) / seg2lengthsq
        let u2 = dot2d(minus2d(p2, q), s) / seg2lengthsq
        u1 = Math.max(0, Math.min(1, u1))
        u2 = Math.max(0, Math.min(1, u2))
        return {
            intersect: true,
            intersectionIsPoint: t1 == t2,
            t1, t2, u1, u2,
        }
    } else if (denominator == 0) {
        // lines are parallel
        return {intersect: false}
    } else {
        let u = uNumerator / denominator
        let t = crossProd2d(minus2d(q, p), s) / denominator
        const maxErrorT = maxDistSq / dot2d(r, r)
        const maxErrorU = maxDistSq / dot2d(s, s)
        if (t >= 0 - maxErrorT && t <= 1 + maxErrorT && u >= 0 - maxErrorU && u <= 1 + maxErrorU) {
            t = Math.max(0, Math.min(1, t))
            u = Math.max(0, Math.min(1, u))
            return {
                intersect: true,
                intersectionIsPoint: true,
                t1: t, t2: t,
                u1: u, u2: u,
            }
        } else {
            return {intersect: false}
        }
    }

}
function allEqual<T>(...args: T[]) {
    const first = args[0]
    for (let i = 1; i < args.length; i++) {
        if (args[i] != first) return false
    }
    return true
}
export interface SegmentSegmentIntersect {
    intersect: true
    /** True if the two segments intersect in only one point,
     * false if they intersect in a segment
     */
    intersectionIsPoint: boolean
    /** parameters in [0,1] along first segment.
     * If intersectionIsPoint, then t1 == t2 */
    t1: number
    t2: number
    /** parameters in [0,1] along second segment.
     * If intersectionIsPoint, then u1 == u2
     */
    u1: number
    u2: number
}
export interface SegmentSegmentDoNotIntersect {
    intersect: false
}
type SegmentSegmentIntersectionType = SegmentSegmentDoNotIntersect | SegmentSegmentIntersect
