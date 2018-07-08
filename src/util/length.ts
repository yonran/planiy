
export interface LengthWithUnit {
    length: number
    unit: LengthUnit
}
export const Me_7 = "1e-7 m"
export interface AngleWithUnit {
    angle: number,
    unit: AngleUnit
}
export const DEG = "deg"
export type AngleUnit = typeof DEG
export interface LengthOrAngle {
    length: LengthWithUnit|null
    angle: AngleWithUnit|null
}


export const DECIMAL_REGEXP_PATTERN = "(?:\\d+(?:\\.\\d*)?|\\.\\d+)"
export const DECIMAL_AND_UNIT_REGEXP_PATTERN = `(${DECIMAL_REGEXP_PATTERN})\\s*(\\w+|["'])`
export const DECIMALS_AND_UNITS_REGEXP_PATTERN = `(?:${DECIMAL_AND_UNIT_REGEXP_PATTERN})+`
export const LENGTH_REGEX_PATTERN = `([+-]?)${DECIMALS_AND_UNITS_REGEXP_PATTERN}`
export const LENGTH_REGEX_ANCHORED = new RegExp(`^${LENGTH_REGEX_PATTERN}$`)
export const LENGTH_AND_ANGLE_PATTERN = `(?:@?(${LENGTH_REGEX_PATTERN}))?\\s*(?:<([+-]?${DECIMAL_REGEXP_PATTERN}))?`
export const LENGTH_AND_ANGLE_REGEX_ANCHORED = new RegExp(`^${LENGTH_AND_ANGLE_PATTERN}$`)
const LENGTH_AND_UNITS_G_REGEX = new RegExp(`${DECIMAL_AND_UNIT_REGEXP_PATTERN}`, "g")
const ONE_LENGTH_AND_UNIT_REGEX = new RegExp(DECIMAL_AND_UNIT_REGEXP_PATTERN)
export const parseLength = (s: string, unit: LengthUnit): LengthWithUnit | null => {
    const m = s.match(LENGTH_REGEX_ANCHORED)
    if (m == null) return null
    const isMinus = m[1] == "-"
    const separateUnits = s.match(LENGTH_AND_UNITS_G_REGEX)
    if (separateUnits == null) return null
    let total = 0
    for (let i = 0; i < separateUnits.length; i++) {
        const component = separateUnits[i]
        const groups = component.match(ONE_LENGTH_AND_UNIT_REGEX)
        if (groups == null) throw Error("Should match here")
        const amount = +groups[1]
        const unit = groups[2]
        const conversion = conversionFactorsToMM[unit]
        if (conversion == null)
            return null  // unknown unit
        total += amount * conversion
    }
    if (isMinus) total = -total
    return {
        length: total,
        unit: unit,
    }
}
export const parseLengthAndAngle = (s: string, unit: LengthUnit): LengthOrAngle | null => {
    const lengthAndAngleMatch = s.match(LENGTH_AND_ANGLE_REGEX_ANCHORED)
    if (lengthAndAngleMatch == null) return null
    let lengthString = lengthAndAngleMatch[1]
    let angleString = lengthAndAngleMatch[5]
    if (lengthString == null && angleString == null)
        return null
    const length: LengthWithUnit|null = lengthString == null ? null : parseLength(lengthString, unit)
    const angle: AngleWithUnit|null = angleString == null ? null : {angle: parseFloat(angleString), unit: DEG}
    return {
        length,
        angle
    }
}
const conversionFactorsToMM: {[unit: string]: number} = {
    "mm": 10,
    "cm": 1000,
    "m": 10000,
    "km": 1000000,
    "\"": 254,
    "in": 254,
    "'": 12*254,
    "ft": 12*254,
}
export type LengthUnit = typeof Me_7

