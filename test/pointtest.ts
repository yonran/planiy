import * as chai from "chai"
import { getSegmentSegmentIntersection } from "../src/point"
const expect = chai.expect

describe("getSegmentSegmentIntersection", () => {
    it("collinear lines intersecting in one point", () => {
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0}))
            .to.deep.equal({
                intersect: true,
                intersectionIsPoint: true,
                t1: 1, t2: 1,
                u1: 0, u2: 0,
            })
    })
    it("collinear lines intersecting in segment", () => {
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 2, y: 0},
            {x: 1, y: 0},
            {x: 3, y: 0}))
            .to.deep.equal({
                intersect: true,
                intersectionIsPoint: false,
                t1: 0.5, t2: 1,
                u1: 0, u2: 0.5,
            })
    })
    it("parallel nonintersecting lines", () => {
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1}))
            .to.deep.equal({intersect: false})
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 2, y: 1}))
            .to.deep.equal({intersect: false})
    })
    it("nonparallel segments intersecting in point", () => {
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0.75, y: -1},
            {x: 0.75, y: 1}))
            .to.deep.equal({
                intersect: true,
                intersectionIsPoint: true,
                t1: 0.75, t2: 0.75,
                u1: 0.5, u2: 0.5,
            })
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 1, y: -1},
            {x: 1, y: 1}))
            .to.deep.equal({
                intersect: true,
                intersectionIsPoint: true,
                t1: 1, t2: 1,
                u1: 0.5, u2: 0.5,
            })
    })
    it("nonparallel segments not intersecting", () => {
        expect(getSegmentSegmentIntersection(
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0.75, y: 1},
            {x: 0.75, y: 2}))
            .to.deep.equal({intersect: false})
    })
    it("almost touching T", () => {
        expect(getSegmentSegmentIntersection(
            {x: 31457.052919921876, y: 4189.306614990234},
            {x: 15119.772919921877, y: 4189.306614990234},
            {x: 24629.532919921876, y: 4189.306614990233},
            {x: 24629.532919921876, y: -3003.9733850097655},
            0.0000001
            ))
            .to.deep.equal({
                intersect: true,
                intersectionIsPoint: true,
                t1: 0.41791044776119407, t2: 0.41791044776119407,
                u1: 0, u2: 0,
            })
        expect(getSegmentSegmentIntersection(
            {x: 31457.052919921876, y: 4189.306614990234},
            {x: 15119.772919921877, y: 4189.306614990234},
            {x: 24629.532919921876, y: 4189.306614990233},
            {x: 24629.532919921876, y: -3003.9733850097655},
            0
            ))
            .to.deep.equal({intersect: false})
    })
})
