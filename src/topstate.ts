import * as toolbar from "./toolbar";
import * as line from "./tools/line"
import { RenderSvgHooks } from "./renderSvg";

export interface TopState {
    tool: toolbar.ToolEnum
    toolState: line.LineToolState | null
    renderHooks: RenderSvgHooks
}
const renderHooks = {
    [toolbar.TOOL_LINE]: line.renderHooks,
    [toolbar.TOOL_ARROW]: line.renderHooks,  // TODO: use arrow renderhooks
}
export const initialState: TopState = {
    tool: toolbar.TOOL_LINE,
    toolState: null,
    renderHooks: renderHooks[toolbar.TOOL_LINE]
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
