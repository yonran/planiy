import * as toolbar from "./toolbar";
import * as line from "./tools/line"
import * as hand from "./tools/hand"
import * as trim from "./tools/trim"
import { RenderSvgHooks } from "./renderSvg";
import { Point2d } from "./point";
import { resolve } from "url";

export interface TopState {
    tool: toolbar.ToolEnum
    toolState: TopToolState|null
    renderHooks: RenderSvgHooks
    zoom: number
    /** Point in document coordinates that will be drawn as the svg origin */
    origin: Point2d
    entities: Entity[]
    loadFilePromise: null|Promise<SaveFileJson>
}
export type TopToolState = line.LineToolState | hand.HandToolState | trim.TrimToolState
export type Entity = LineEntity
export const ENTITY_TYPE_LINE = "Line"
export interface LineEntity {
    type: typeof ENTITY_TYPE_LINE
    start: Point2d
    end: Point2d
}
const renderHooks = {
    [toolbar.TOOL_LINE]: line.renderHooks,
    [toolbar.TOOL_HAND]: hand.renderHooks,
    [toolbar.TOOL_TRIM]: trim.renderHooks,
    [toolbar.TOOL_ARROW]: line.renderHooks,  // TODO: use arrow renderhooks
}
export const initialState: TopState = {
    tool: toolbar.TOOL_LINE,
    toolState: null,
    renderHooks: renderHooks[toolbar.TOOL_LINE],
    zoom: 25/12/254,  // 25 px per foot
    origin: {x: 0, y: 0},
    entities: [],
    loadFilePromise: null,
}
export const reducer = (state: TopState | undefined, action: TopLevelActions): TopState => {
    state = state || initialState
    switch (action.type) {
        case "ToolChange": return {
            ...state,
            tool: action.payload.tool,
            renderHooks: renderHooks[action.payload.tool]
        }
        case "LoadedFile": return {
            ...state,
            ...action.payload
        }
        case line.ACTION_LINE_START:
        case line.ACTION_LINE_CHANGE:
        case line.ACTION_LINE_COMMIT:
        case line.ACTION_LINE_CLOSE:
        case line.ACTION_LINE_CANCEL:
        case line.ACTION_LINE_SET_CONSTRAINT:
            return line.reducer(state, action)
        case hand.ACTION_HAND_START:
        case hand.ACTION_HAND_DRAG:
        case hand.ACTION_HAND_UP:
        case hand.ACTION_HAND_ZOOM:
            return hand.reducer(state, action)
        case trim.ACTION_TRIM:
            return trim.reducer(state, action)
        default: return state
    }
}

interface ChangeToolEvent {type: "ToolChange", payload: {tool: toolbar.ToolEnum}}
const changeToolAction = (tool: toolbar.ToolEnum): ChangeToolEvent => ({type: "ToolChange", payload: {tool}})
interface LoadedFileAction {type: "LoadedFile", payload: SaveFileJson}
const loadedFileAction = (result: SaveFileJson): LoadedFileAction => ({type: "LoadedFile", payload: result})
export type TopLevelActions = ChangeToolEvent | LoadedFileAction | line.LineAction | hand.HandAction | trim.TrimAction

export interface SaveFileJson {
    origin: Point2d
    entities: Entity[]
    zoom: number
}
export const saveFileUrl = (state: TopState): string => {
    const {entities,zoom,origin} = state
    const json = JSON.stringify({entities,zoom,origin})
    return `data:application/octet-stream,${encodeURIComponent(json)}`
}
export const loadFile = (file: File): Promise<SaveFileJson> => {
    const fr = new FileReader
    fr.readAsText(file)
    return new Promise((resolve, reject) => {
        fr.onload = resolve
        fr.onerror = reject
    }).then(() => {
        const s = fr.result as string
        const newDoc = JSON.parse(s)
        const {origin, entities, zoom} = newDoc
        return {origin, entities, zoom}
    })
}

export const actionCreators = {
    loadedFileAction,
    changeToolAction,
    ...line.actionCreators,
    ...hand.actionCreators,
    ...trim.actionCreators,
}
