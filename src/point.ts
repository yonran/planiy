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
    const dx = (p1.x - p2.x)
    const dy = (p1.y - p2.y)
    const distsq = dx*dx + dy*dy
    if (distsq <= distance*distance) {
        return distsq
    } else {
        return undefined
    }
}