import * as React from "react"
import { connect } from 'react-redux';

import "./MapToolbox.css"

export class MapToolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTool: "grabber"
    }
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
          <div className={this.classifyTool("bg", "#000000")}
              onClick={(event) => this.handleToolClick(event)}
              style={{ backgroundColor: "#000000" }}
              data-tool="bg:#000000"/>
          <div className={this.classifyTool("bg", "#880000")}
              onClick={(event) => this.handleToolClick(event)}
              style={{ backgroundColor: "#880000" }}
              data-tool="bg:#880000"/>
          <div className={this.classifyTool("bg", "#008800")}
              onClick={(event) => this.handleToolClick(event)}
              style={{ backgroundColor: "#008800" }}
              data-tool="bg:#008800"/>
          <div className={this.classifyTool("bg", "#000088")}
              onClick={(event) => this.handleToolClick(event)}
              style={{ backgroundColor: "#000088" }}
              data-tool="bg:#000088"/>
          <div className={this.classifyTool("bg", "white")}
              onClick={(event) => this.handleToolClick(event)}
              style={{ backgroundColor: "white" }}
              data-tool="bg:white"/>
        </form>
      </div>
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
    this.setState({ "selectedTool": event.currentTarget.getAttribute("data-tool") })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(MapToolbox)

