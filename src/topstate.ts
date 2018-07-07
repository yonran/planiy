import * as toolbar from "./toolbar";
import * as line from "./tools/line"
import { RenderSvgHooks } from "./renderSvg";
import { Point2d } from "./point";

export interface TopState {
    tool: toolbar.ToolEnum
    toolState: TopToolState|null
    renderHooks: RenderSvgHooks
    zoom: number
    entities: Entity[]
}
export type TopToolState = line.LineToolState
export type Entity = LineEntity
export const ENTITY_TYPE_LINE = "Line"
export interface LineEntity {
    type: typeof ENTITY_TYPE_LINE
    start: Point2d
    end: Point2d
}
const renderHooks = {
    [toolbar.TOOL_LINE]: line.renderHooks,
    [toolbar.TOOL_ARROW]: line.renderHooks,  // TODO: use arrow renderhooks
}
export const initialState: TopState = {
    tool: toolbar.TOOL_LINE,
    toolState: null,
    renderHooks: renderHooks[toolbar.TOOL_LINE],
    zoom: 1,
    entities: [],
}
export const reducer = (state: TopState | undefined, action: TopLevelActions): TopState => {
    state = state || initialState
    switch (action.type) {
        case "ToolChange": return {
            ...state,
            tool: action.payload.tool,
            renderHooks: renderHooks[action.payload.tool]
        }
        case line.ACTION_LINE_START:
        case line.ACTION_LINE_CHANGE:
        case line.ACTION_LINE_COMMIT:
        case line.ACTION_LINE_CLOSE:
        case line.ACTION_LINE_CANCEL:
            return line.reducer(state, action)
        default: return state
    }
}

interface ChangeToolEvent {type: "ToolChange", payload: {tool: toolbar.ToolEnum}}
const changeToolAction = (tool: toolbar.ToolEnum): ChangeToolEvent => ({type: "ToolChange", payload: {tool}})
export type TopLevelActions = ChangeToolEvent | line.LineAction

export const actionCreators = {
    changeToolAction,
    ...line.actionCreators,
}
