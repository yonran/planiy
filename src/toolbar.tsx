import * as React from "react";

export const TOOL_LINE = "line"
export const TOOL_ARROW = "arrow"
export type ToolEnum = typeof TOOL_LINE | typeof TOOL_ARROW

export class Toolbar extends React.Component<{
    selectedTool: ToolEnum,
    onSelect: (value: ToolEnum) => any
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
        </div>
    }
}
