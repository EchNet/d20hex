import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import config from "./config"
import PaletteGroup from "./PaletteGroup"
import "./MapToolbox.css"

let DEBUG = config("DEBUG");

export class MapToolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bgToolChoices: [
        "bg|#848484", "bg|#bda878", "bg|#449944", "bg|#7686ee", "bg|"
      ],
      counterToolChoices: [
        "counter|black", "counter|#b00", "counter|#808", "function|reset"
      ],
      tokenToolChoices: [
        "token|url(http://ech.net/img/d20hex/wizard.png)",
        "token|url(http://ech.net/img/d20hex/evilbaron.png)",
        "token|url(http://ech.net/img/d20hex/ghoul.png)",
        "token|url(http://ech.net/img/d20hex/girl.png)",
        "token|url(http://ech.net/img/d20hex/knight.png)",
        "token|url(http://ech.net/img/d20hex/lurch.png)",
        "token|url(http://ech.net/img/d20hex/hobbit.jpg)",
        "token|url(http://ech.net/img/d20hex/misterio.jpg)",
        "token|url(http://ech.net/img/d20hex/merfu.png)",
        "token|url(http://ech.net/img/d20hex/lashar.jpg)",
        "token|url(http://ech.net/img/d20hex/necrogirl.png)",
        "token|url(http://ech.net/img/d20hex/telly.png)",
        "token|url(http://ech.net/img/d20hex/telly2.jpg)",
        "token|url(http://ech.net/img/d20hex/chunk.jpg)",
        "token|url(http://ech.net/img/d20hex/monk.png)"
      ]
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
        <PaletteGroup paletteValue={this.props.selectedTool} 
            choices={this.state.bgToolChoices}
            onSelect={(value) => this.selectNewTool(value)}/>
        <PaletteGroup paletteValue={this.props.selectedTool} 
            labels={this.props.counterValues}
            choices={this.state.counterToolChoices}
            onSelect={(value) => this.selectNewTool(value)}/>
        <PaletteGroup paletteValue={this.props.selectedTool} 
            choices={this.state.tokenToolChoices}
            onSelect={(value) => this.selectNewTool(value)}/>
      </div>
    )
  }
  classifyTool(toolName) {
    const isSelected = this.props.selectedTool && this.props.selectedTool == toolName;
    return `tool ${toolName}${isSelected ? " selected" : ""}`;
  }
  selectNewTool(newSelectedTool) {
    this.props.dispatch({ type: actions.SELECT_TOOL, data: newSelectedTool })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(MapToolbox)
