import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import config from "./config"
import "./MapToolbox.css"

let DEBUG = config("DEBUG");

export class MapToolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bgFillStyles: [
        "#848484", "#bda878", "#449944", "#7686ee", "white"
      ],
      bgFillStyleIndex: 0,
      counterFillStyles: [ "black", "#800", "#808" ],
      counterFillStyleIndex: 0,
      tokenFillStyles: [
        "url(http://ech.net/img/d20hex/evilbaron.png)",
        "url(http://ech.net/img/d20hex/ghoul.png)",
        "url(http://ech.net/img/d20hex/girl.png)",
        "url(http://ech.net/img/d20hex/knight.png)",
        "url(http://ech.net/img/d20hex/lurch.png)",
        "url(http://ech.net/img/d20hex/necrogirl.png)",
        "url(http://ech.net/img/d20hex/wizard.png)"
      ],
      tokenFillStyleIndex: 0,
    }
  }
  render() {
    return (
      <div className="MapToolbox">
        <div className={this.classifyTool("grabber")}
            onClick={(event) => this.selectNewTool("grabber")}>
          <i className="material-icons">touch_app</i>
        </div>
        { !!DEBUG && (
          <div className={this.classifyTool("info")}
              onClick={(event) => this.selectNewTool("info")}>
            <i className="material-icons">help_outline</i>
          </div>
        )}
        <hr></hr>
        { this.renderBgTool() }
        <hr></hr>
        { this.renderCounterTool() }
        <hr></hr>
        { this.renderTokenTool() }
      </div>
    )
  }
  renderBgTool() {
    const currentFillStyle = this.state.bgFillStyles[this.state.bgFillStyleIndex]
    const toolName = `bg:${currentFillStyle}`
    return (
      <div className="tool-wrapper">
        <div className="left-arrow" onClick={() => this.handleBgToolRotate(-1)}>{"<"}</div>
        <div className={this.classifyTool("bg", currentFillStyle)}
            onClick={(event) => this.selectNewTool(toolName)}
            style={{ backgroundColor: currentFillStyle }}/>
        <div className="right-arrow" onClick={() => this.handleBgToolRotate(1)}>{">"}</div>
      </div>
    )
  }
  handleBgToolRotate(incr) {
    const nFillStyles = this.state.bgFillStyles.length;
    const newFillStyleIndex = (this.state.bgFillStyleIndex + nFillStyles + incr) % nFillStyles;
    this.setState({ bgFillStyleIndex: newFillStyleIndex })
    if (this.props.selectedTool.startsWith("bg")) {
      const newFillStyle = this.state.bgFillStyles[newFillStyleIndex]
      const toolName = `bg:${newFillStyle}`
      this.selectNewTool(toolName)
    }
  }
  renderCounterTool() {
    const currentFillStyle = this.state.counterFillStyles[this.state.counterFillStyleIndex]
    const digits = this.props.counterValue.toString().length;
    return (
      <div className="tool-wrapper">
        <div className="left-arrow" onClick={() => this.handleCounterToolRotate(-1)}>{"<"}</div>
        <div className={this.classifyTool("counter", currentFillStyle)}
            onClick={(event) => this.selectNewTool(`counter:${currentFillStyle}`)}
            style={{
                color: "white",
                backgroundColor: currentFillStyle,
                width: "32px",
                height: "32px",
                lineHeight: `${28 - digits*2}px`,
                borderRadius: "50%",
                fontSize: `${25 - digits*2}px`,
                textAlign: "center"
            }}>
          { this.props.counterValue }
        </div>
        <div className="right-arrow" onClick={() => this.handleCounterToolRotate(1)}>{">"}</div>
      </div>
    )
  }
  handleCounterToolRotate(incr) {
    const nFillStyles = this.state.counterFillStyles.length;
    const newFillStyleIndex = (this.state.counterFillStyleIndex + nFillStyles + incr) % nFillStyles;
    this.setState({ counterFillStyleIndex: newFillStyleIndex })
    if (this.props.selectedTool && this.props.selectedTool.startsWith("counter")) {
      const newFillStyle = this.state.counterFillStyles[newFillStyleIndex]
      const toolName = `counter:${newFillStyle}`;
      this.selectNewTool(toolName)
    }
  }
  renderTokenTool() {
    const currentFillStyle = this.state.tokenFillStyles[this.state.tokenFillStyleIndex]
    const digits = this.props.counterValue.toString().length;
    return (
      <div className="tool-wrapper">
        <div className="left-arrow" onClick={() => this.handleTokenToolRotate(-1)}>{"<"}</div>
        <div className={this.classifyTool("token", currentFillStyle)}
            onClick={(event) => this.selectNewTool(`token:${currentFillStyle}`)}
            style={{
                backgroundImage: currentFillStyle,
                backgroundSize: "cover",
                width: "32px",
                height: "32px",
                lineHeight: `${28 - digits*2}px`,
                borderRadius: "50%"
            }}>
        </div>
        <div className="right-arrow" onClick={() => this.handleTokenToolRotate(1)}>{">"}</div>
      </div>
    )
  }
  handleTokenToolRotate(incr) {
    const nFillStyles = this.state.tokenFillStyles.length;
    const newFillStyleIndex = (this.state.tokenFillStyleIndex + nFillStyles + incr) % nFillStyles;
    this.setState({ tokenFillStyleIndex: newFillStyleIndex })
    if (this.props.selectedTool.startsWith("token")) {
      const newFillStyle = this.state.tokenFillStyles[newFillStyleIndex]
      const toolName = `token:${newFillStyle}`;
      this.selectNewTool(toolName)
    }
  }
  classifyTool(name1, name2 = null) {
    const toolName = name2 ? `${name1}:${name2}` : name1;
    let className = `tool ${name1}`;
    if (name2 == "white") {
      className = `${className} white`;
    }
    if (this.props.selectedTool.startsWith(name1)) {
      className = `${className} selected`;
    }
    return className;
  }
  selectNewTool(newSelectedTool) {
    this.props.dispatch({ type: actions.SELECT_TOOL, tool: newSelectedTool })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(MapToolbox)

