import * as React from "react";

export const TOOL_LINE = "line"
export const TOOL_ARROW = "arrow"
export const TOOL_HAND = "hand"
export type ToolEnum = typeof TOOL_LINE | typeof TOOL_ARROW | typeof TOOL_HAND

export class Toolbar extends React.Component<{
    selectedTool: ToolEnum
    onSelect: (value: ToolEnum) => any
    onLoad: (file: File) => any
    onSave: () => string
}> {
    componentDidMount () {  }
    
    render() {
        const dispatchClick = (event: ToolEnum) => (e: React.MouseEvent<HTMLButtonElement>) => {
            if (e.button == 0 && !(e.target as HTMLButtonElement).disabled) {
                this.props.onSelect(event)
            }
        }
        return <div>
            <button disabled={this.props.selectedTool == TOOL_LINE} onClick={dispatchClick(TOOL_LINE)}>Line</button>
            <button disabled={this.props.selectedTool == TOOL_ARROW} onClick={dispatchClick(TOOL_ARROW)}>Arrow</button>
            <button disabled={this.props.selectedTool == TOOL_HAND} onClick={dispatchClick(TOOL_HAND)}>Hand</button>
            <input type="file" onChange={(e) => {if (e.currentTarget.files != null && e.currentTarget.files.length > 0) this.props.onLoad(e.currentTarget.files[0])}}/>
            <a download="plan.json" onClick={(e) => {e.currentTarget.href = this.props.onSave()}}>Download</a>
        </div>
    }
}
