import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import config from "./config"
import "./MapToolbox.css"

let DEBUG = config("DEBUG");

export class MapToolbox extends React.Component {
  render() {
    return (
      <div className="MapToolbox">
        <form>
          <div className={this.classifyTool("grabber")}
              onClick={(event) => this.handleToolClick(event)}
              data-tool="grabber">
            <i className="material-icons">touch_app</i>
          </div>
          { !!DEBUG && (
            <div className={this.classifyTool("info")}
                onClick={(event) => this.handleToolClick(event)}
                data-tool="info">
              <i className="material-icons">help_outline</i>
            </div>
          )}
          <hr></hr>
          { this.renderBgTool("#848484") }
          { this.renderBgTool("#bda878") }
          { this.renderBgTool("#449944") }
          { this.renderBgTool("#7686ee") }
          { this.renderBgTool("white") }
          <hr></hr>
          { this.renderCounterTool("black") }
        </form>
      </div>
    )
  }
  renderCounterTool(color) {
    const digits = this.props.counterValue.toString().length;
    return (
      <div className={this.classifyTool("counter")}
          onClick={(event) => this.handleToolClick(event)}
          style={{
              color: "white",
              backgroundColor: color,
              width: "32px",
              height: "32px",
              lineHeight: `${28 - digits*2}px`,
              borderRadius: "50%",
              fontSize: `${25 - digits*2}px`,
              textAlign: "center"
          }}
          data-tool="counter">{ this.props.counterValue }</div>
    )
  }
  renderBgTool(color) {
    return (
      <div className={this.classifyTool("bg", color)}
          onClick={(event) => this.handleToolClick(event)}
          style={{ backgroundColor: color }}
          data-tool={`bg:${color}`}/>
    )
  }
  classifyTool(name1, name2 = null) {
    const toolName = name2 ? `${name1}:${name2}` : name1;
    let className = `tool ${name1}`;
    if (name2 == "white") {
      className = `${className} white`;
    }
    if (this.props.selectedTool == toolName) {
      className = `${className} selected`;
    }
    return className;
  }
  handleToolClick(event) {
    const newSelectedTool = event.currentTarget.getAttribute("data-tool")
    this.props.dispatch({ type: actions.SELECT_TOOL, tool: newSelectedTool })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(MapToolbox)

