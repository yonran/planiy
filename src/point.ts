export interface Point2d {
    x: number
    y: number
}
export const point2dsEqual = (p1: Point2d, p2: Point2d): boolean =>
    p1.x == p2.x && p1.y == p2.y
