import { parseLength, Me_7, LENGTH_REGEX_ANCHORED, parseLengthAndAngle, DECIMAL_AND_UNIT_REGEXP_PATTERN, DECIMAL_REGEXP_PATTERN, DEG } from "../src/util/length"
import * as chai from "chai"
const expect = chai.expect

describe("length helpers", () => {
    describe("DECIMAL_REGEXP_PATTERN", () => {
        it("should accept numbers", () => {
            const regexp = new RegExp(DECIMAL_REGEXP_PATTERN);
            expect(regexp.test("1")).to.equal(true)
            expect(regexp.test("123")).to.equal(true)
            expect(regexp.test("-1")).to.equal(true)
            expect(regexp.test("-152")).to.equal(true)
            expect(regexp.test("-1.0")).to.equal(true)
            expect(regexp.test("-13.04")).to.equal(true)
            expect(regexp.test("+.3")).to.equal(true)
            expect(regexp.test("+.032")).to.equal(true)
        })
    })
    describe("DECIMAL_AND_UNIT_REGEXP_PATTERN", () => {
        it("should accept lengths", () => {
            const regexp = new RegExp(DECIMAL_AND_UNIT_REGEXP_PATTERN)
            expect(regexp.test("1'"), "1'").to.equal(true)
            expect(regexp.test("1m"), "1m").to.equal(true)
            expect(regexp.test("1cm"), "1cm").to.equal(true)
            expect(regexp.test("1 cm"), "1 cm").to.equal(true)
        })
    })
    describe("LENGTH_REGEX_ANCHORED", () => {
        it("should accept lengths", () => {
            expect(LENGTH_REGEX_ANCHORED.test("1'")).to.equal(true)
            expect(LENGTH_REGEX_ANCHORED.test("1'3\""), "1'3\"").to.equal(true)
            expect(LENGTH_REGEX_ANCHORED.test("111'"), "111'").to.equal(true)
            expect(LENGTH_REGEX_ANCHORED.test("12'1\""), "12'1\"").to.equal(true)
            expect(LENGTH_REGEX_ANCHORED.test("1cm"), "1cm").to.equal(true)
        })
    })
})
describe('parseLength', () => {
    it('should parse positive lengths', () => {
        expect(parseLength("1'", Me_7), "1'").to.deep.equal({length:12*254,unit:Me_7})
        expect(parseLength("1\"", Me_7), "1\"").to.deep.equal({length:254,unit:Me_7})
        expect(parseLength("1'1\"", Me_7), "1'1\"").to.deep.equal({length:13*254,unit:Me_7})
        expect(parseLength("3\"", Me_7), "3\"").to.deep.equal({length:3*254,unit:Me_7})
        expect(parseLength("12'1\"", Me_7), "12'1\"").to.deep.equal({length:(12*12+1)*254,unit:Me_7})
        expect(parseLength("12.5'", Me_7), "12.5'").to.deep.equal({length:12.5*12*254,unit:Me_7})
        expect(parseLength("1cm", Me_7), "1cm'").to.deep.equal({length:1000,unit:Me_7})
    })
})
describe('parseLengthAndAngle', () => {
    it('should parse length alone', () => {
        expect(parseLengthAndAngle("1'", Me_7), "1'").to.deep.equal({length:{length:12*254,unit:Me_7}, angle: null})
        expect(parseLengthAndAngle("@1'", Me_7), "@1'").to.deep.equal({length:{length:12*254,unit:Me_7}, angle: null})
        expect(parseLengthAndAngle("@1'12\"", Me_7), "@1'12\"").to.deep.equal({length:{length:24*254,unit:Me_7}, angle: null})
    })
    it('should parse angle alone', () => {
        expect(parseLengthAndAngle("<1", Me_7), "<1").to.deep.equal({length:null, angle: {angle:1,unit:DEG}})
        expect(parseLengthAndAngle("<90", Me_7), "<90").to.deep.equal({length:null, angle: {angle:90,unit:DEG}})
        expect(parseLengthAndAngle("<-80", Me_7), "<-80").to.deep.equal({length:null, angle: {angle:-80,unit:DEG}})
        expect(parseLengthAndAngle("<.125", Me_7), "<.125").to.deep.equal({length:null, angle: {angle:.125,unit:DEG}})
    })
    it('should parse length with angle', () => {
        expect(parseLengthAndAngle("@1\"<1", Me_7), "@1\"<1").to.deep.equal({length:{length:254,unit:Me_7}, angle: {angle:1,unit:DEG}})
        expect(parseLengthAndAngle("@1'1\"<1", Me_7), "@1'1\"<1").to.deep.equal({length:{length:13*254,unit:Me_7}, angle: {angle:1,unit:DEG}})
    })
})
