import * as React from "react"
import { connect } from 'react-redux';

import "./MapToolbox.css"

export class MapToolbox extends React.Component {
  static defaultState() {
    return {
      selectedTool: "grabber"
    }
  }
  constructor(props) {
    super(props)
    this.state = MapToolbox.defaultState()
  }
  render() {
    return (
      <div className="MapToolbox">
        <form>
          <div className={this.classifyTool("grabber")}
              onClick={(event) => this.handleToolClick(event)}
              data-tool="grabber">
            <i className="material-icons">touch_app</i>
          </div>
          <hr></hr>
          { this.renderBgTool("#777777") }
          { this.renderBgTool("#bda878") }
          { this.renderBgTool("#449944") }
          { this.renderBgTool("#7686ee") }
          { this.renderBgTool("white") }
        </form>
      </div>
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
    if (this.state.selectedTool == toolName) {
      className = `${className} selected`;
    }
    return className;
  }
  handleToolClick(event) {
    const newSelectedTool = event.currentTarget.getAttribute("data-tool")
    const onChange = this.props.onChange;
    this.setState((oldState) => {
      if (newSelectedTool != oldState.selectedTool) {
        onChange && this.props.onChange({ selectedTool: newSelectedTool })
        return({ selectedTool: newSelectedTool })
      }
    })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(MapToolbox)

