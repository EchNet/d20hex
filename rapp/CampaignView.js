import * as React from "react"
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import apiConnector from "./connectors/api"
import actions from "./actions"
import ChronicleView from "./ChronicleView"
import DiceView from "./DiceView"
import Map from "./Map"
import MapToolbox from "./MapToolbox"
import PlayerRoster from "./PlayerRoster"
import RosterView from "./RosterView"
import TimeLabel from "./TimeLabel"
import { Menu, MenuButton, MenuItem } from "./Menu"
import "./CampaignView.css"

const GM_TOOLS = {  // These values are accessible only by the GM.
  "map": 1,
  "player": 1,
  "ticket": 1,
  "chronicles": 1
}

export class CampaignView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visibleTool: "map", zoom: 0 }
  }
  static getDerivedStateFromProps(props, state) {
    if (!props.isGM && GM_TOOLS[state.visibleTool]) {
      return { visibleTool: null }
    }
    return null;
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="CampaignView">
        <header>
          { this.renderViewMenu() }
          { this.renderCurrentLocation() }
          { this.renderCurrentTime() }
        </header>
        <section className="fillBottom">
          <Map zoom={this.state.zoom}/>
          <div className="toolLayer">
            { this.state.visibleTool === "map" &&
                <div className="overTopLeft"><MapToolbox/></div> }
            { this.state.visibleTool === "player" &&
                <div className="overCenter"><PlayerRoster onClose={() => this.handleToolClose()}/></div> }
            { this.state.visibleTool === "chronicles" &&
                <div className="overCenter"><ChronicleView/></div> }
            { this.state.visibleTool === "roster" &&
                <div className="overCenter"><RosterView/></div> }
            <div style={this.state.visibleTool === "dice" ? {} : {visibility: "hidden"}} className="overCenter"><DiceView/></div>
            <div className="overBottomRight">
              <div className="zoomer">
                Zoom &nbsp;
                <input type="number" value={this.state.zoom} min="0" max="2" step="1"
                    onChange={(e) => this.setState({ zoom: parseInt(e.target.value) })} />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
  renderViewMenu() {
    return (
      <Menu>
        <MenuButton>
          <i className="material-icons">menu</i> Menu
        </MenuButton>
        <ul>
          { this.renderToolToggleMenuItem("map", "Map Tool") }
          { this.renderToolToggleMenuItem("player", "Player Roster") }
          { this.renderToolToggleMenuItem("roster", "Roster") }
          { this.renderToolToggleMenuItem("chronicles", "Chronicles") }
          { this.renderToolToggleMenuItem("dice", "Dice Roller") }
          <MenuItem onClick={() => this.closeCampaign()}>
            <Link to="/">
              Exit Campaign
            </Link>
          </MenuItem>
        </ul>
      </Menu>
    )
  }
  renderToolToggleMenuItem(toolName, toolLabel) {
    return !this.props.isGM && GM_TOOLS[toolName]
      ? null : (
        <MenuItem onClick={() => this.showHideTool(toolName)}>
          { this.state.visibleTool === toolName ? "Hide" : "Show"} {toolLabel}
        </MenuItem>
      )
  }
  showHideTool(toolName) {
    this.setState((oldState) => ({
      visibleTool: (oldState.visibleTool !== toolName)
          ? toolName
          : (toolName === "map" || !this.props.isGM ? "" : "map")
    }))
  }
  handleToolClose() {
    this.setState((oldState) => ({
      visibleTool: (oldState.visibleTool === "map" || !this.props.isGM ? "" : "map")
    }))
  }
  renderCurrentTime() {
    try {
      return <TimeLabel time={this.props.campaignNotes.notes.time.json}/>
    }
    catch (e) {
      return <TimeLabel/>
    }
  }
  renderCurrentLocation() {
    try {
      return (
        <div>
          <span className="campaignName">{ this.props.campaign.name }</span> : <span> </span>
          <span className="whereValue">{this.props.campaignNotes.notes.location.text}</span>
        </div>
      )
    }
    catch (e) {
      return <div><span>(No location set)</span></div>
    }
  }
  renderTimeCard() {
    let priorText = "";
    try {
      priorText = this.props.campaignNotes.notes.time.text;
    }
    catch (e) {
    }
    return (
      <div className="card">
        <div>{ priorText }</div>
        { this.props.isGM && this.renderTimeForm() }
      </div>
    )
  }
  renderTimeForm() {
    return (
      <form onSubmit={(event) => this.handleTimeFormSubmit(event)}>
        <input ref="dayInput" placeholder="Day"/>
        <input ref="hourInput" placeholder="Hour"/>
        <input ref="minuteInput" placeholder="Minute"/>
        <input ref="secondInput" placeholder="Second"/>
        <textarea ref="timeTextInput" placeholder="What's going on"/>
        <input type="submit"/>
      </form>
    )
  }
  renderLocationCard() {
    return (
      <div className="card right">
        <form onSubmit={(event) => this.handleLocationFormSubmit(event)}>
          <input type="hidden" name="topic" value="location" />
          <div>
            <input type="text" name="text" placeholder="Where"
                  value={this.state.locationInput}
                  onChange={(event) => this.handleLocationInputChange(event)}/>
          </div>
          <input type="submit" disabled={this.state.locationInput.length > 0 ? "" : "disabled"}/>
        </form>
      </div>
    )
  }
  closeCampaign() {
    this.props.dispatch({ type: actions.CLOSE_CAMPAIGN })
  }
}
const mapState = (state) => {
  return Object.assign({ isGM: state.campaign.can_manage }, state);
}
export default connect(mapState)(CampaignView)
