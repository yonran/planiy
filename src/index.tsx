
import * as renderSvg from "./renderSvg"
import * as toolbar from "./toolbar"
import { TopState, initialState, reducer, actionCreators, saveFileUrl, SaveFileJson, loadFile } from "./topstate";

import * as React from "react";
import * as ReactDOM from "react-dom"
import { Provider, connect} from "react-redux"

import { bindActionCreators, Dispatch, ActionCreatorsMapObject, createStore } from "redux";
// import { enhanceComponent } from "prism-react"

const div = document.createElement("div")
document.body.appendChild(div)

type Prop = TopState & typeof actionCreators

class ViewUrlPage extends React.Component<Prop> {
    componentDidMount () {  }
    render() {
        return <div>
            <toolbar.Toolbar
                selectedTool={this.props.tool}
                onSelect={this.props.changeToolAction}
                onLoad={(file: File) => {
                    loadFile(file).then((data: SaveFileJson) => {
                        this.props.loadedFileAction(data)
                    })
                }}
                onSave={() => saveFileUrl(this.props)}
                />
            <renderSvg.RenderSvg
                state={this.props}
                actionCreators={this.props}
                renderHooks={this.props.renderHooks}
                />
        </div>
    }
}
const store = createStore(
    reducer, initialState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
)

const EnhancedViewUrlPage = connect(
    (state: TopState) => state,
    (dispatch: Dispatch) => bindActionCreators(actionCreators, dispatch)
)(ViewUrlPage)
ReactDOM.render(
    <Provider store={store}>
        <EnhancedViewUrlPage/>
    </Provider>,
    div
);