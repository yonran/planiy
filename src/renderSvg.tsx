import * as React from "react";
import * as ReactDOM from "react-dom"
import { TopState, actionCreators, Entity, ENTITY_TYPE_LINE } from "./topstate";

export interface RenderSvgHooks {
    cursor?: string
    renderToolOverlay?: (topState: TopState) => JSX.Element
    svgMouseDown?: (creators: typeof actionCreators) => React.MouseEventHandler<SVGSVGElement>
    svgMouseMove?: (creators: typeof actionCreators) => React.MouseEventHandler<SVGSVGElement>
    svgMouseUp?: (creators: typeof actionCreators) => React.MouseEventHandler<SVGSVGElement>
    keyPress?: (creators: typeof actionCreators) => React.KeyboardEventHandler<HTMLInputElement>
    keyDown?: (creators: typeof actionCreators) => React.KeyboardEventHandler<HTMLInputElement>
}
export interface Props {
    state: TopState
    renderHooks: RenderSvgHooks
    actionCreators: typeof actionCreators
}

export class RenderSvg extends React.Component<Props> {
    input: HTMLInputElement|null
    constructor(props: Readonly<Props>) {
        super(props)
        this.input = null
    }
    componentDidMount () {  }
    componentDidUpdate() {
        if (this.input != null)
            this.input.focus()
    }
    render(): JSX.Element {
        return <div>
            <svg
                width="800" height="600"
                viewBox="0 0 800 400"
                cursor={this.props.renderHooks.cursor}
                onMouseDown={this.props.renderHooks.svgMouseDown != null ? this.props.renderHooks.svgMouseDown(this.props.actionCreators) : undefined}
                onMouseMove={this.props.renderHooks.svgMouseMove != null ? this.props.renderHooks.svgMouseMove(this.props.actionCreators) : undefined}
                onMouseUp={this.props.renderHooks.svgMouseUp != null ? this.props.renderHooks.svgMouseUp(this.props.actionCreators) : undefined}
                >
                {this.props.state.entities.map((entity: Entity, i: number) => {
                    switch (entity.type) {
                        case ENTITY_TYPE_LINE:
                            return <line
                                key={i}
                                x1={entity.start.x} y1={entity.start.y}
                                x2={entity.end.x} y2={entity.end.y}
                                strokeWidth="1"
                                stroke="black"
                                />
                        default:
                            return null
                    }
                })}
                {this.props.renderHooks.renderToolOverlay != null ? this.props.renderHooks.renderToolOverlay(this.props.state) : null}
            </svg><br/>
            <input autoFocus
                ref={(input) => this.input = input}
                onKeyPress={this.props.renderHooks.keyPress != null ? this.props.renderHooks.keyPress(this.props.actionCreators) : undefined}
                onKeyDown={this.props.renderHooks.keyDown != null ? this.props.renderHooks.keyDown(this.props.actionCreators) : undefined}
                />
        </div>
    }
}
