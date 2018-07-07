import * as React from "react";
import * as ReactDOM from "react-dom"
import { TopState, actionCreators } from "./topstate";

export interface RenderSvgHooks {
    cursor?: string
    renderToolOverlay?: (topState: TopState) => JSX.Element
    svgMouseDown?: (creators: typeof actionCreators) => React.MouseEventHandler<SVGSVGElement>
    svgMouseMove?: (creators: typeof actionCreators) => React.MouseEventHandler<SVGSVGElement>
    keyPress?: (creators: typeof actionCreators) => React.KeyboardEventHandler<HTMLInputElement>
}
export interface Props {
    state: TopState
    renderHooks: RenderSvgHooks
    actionCreators: typeof actionCreators
}

export class RenderSvg extends React.Component<Props> {
    componentDidMount () {  }
    render(): JSX.Element {
        return <div>
            <svg
                width="800" height="600"
                viewBox="0 0 800 400"
                cursor={this.props.renderHooks.cursor}
                onMouseDown={this.props.renderHooks.svgMouseDown != null ? this.props.renderHooks.svgMouseDown(this.props.actionCreators) : undefined}
                onMouseMove={this.props.renderHooks.svgMouseMove != null ? this.props.renderHooks.svgMouseMove(this.props.actionCreators) : undefined}
                >
                {this.props.renderHooks.renderToolOverlay != null ? this.props.renderHooks.renderToolOverlay(this.props.state) : null}
            </svg><br/>
            <input autoFocus onKeyPress={this.props.renderHooks.keyPress != null ? this.props.renderHooks.keyPress(this.props.actionCreators) : undefined}/>
        </div>
    }
}
