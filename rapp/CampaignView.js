import * as React from "react"
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import apiConnector from "./connectors/api"
import actions from "./actions"
import ChronicleView from "./ChronicleView"
import Map from "./Map"
import MapToolbox from "./MapToolbox"
import RosterView from "./RosterView"
import TicketTool from "./TicketTool"
import TimeLabel from "./TimeLabel"
import { Menu, MenuButton, MenuItem } from "./Menu"
import "./CampaignView.css"

const ADMIN_TOOLS = {  // These values are accessible only by admin.
  "map": 1,
  "player": 1,
  "ticket": 1
}

export class CampaignView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visibleTool: "map" }
  }
  static getDerivedStateFromProps(props, state) {
    if (!props.campaign.can_manage && ADMIN_TOOLS[state.visibleTool]) {
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
          <Map/>
          <div className="toolLayer">
            { this.state.visibleTool === "map" && <MapToolbox/> }
            { this.state.visibleTool === "ticket" &&
                <TicketTool onClose={() => this.handleToolClose()}/> }
            { this.state.visibleTool === "chronicles" && <ChronicleView/> }
            { this.state.visibleTool === "roster" && <RosterView/> }
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
          { !!this.props.campaign.can_manage &&
            this.renderToolToggleMenuItem("map", "Map Tool") }
          { !!this.props.campaign.can_manage &&
            this.renderToolToggleMenuItem("ticket", "Ticketing Tool") }
          { this.renderToolToggleMenuItem("roster", "Roster") }
          { this.renderToolToggleMenuItem("chronicles", "Chronicles") }
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
    return !this.props.campaign.can_manage && ADMIN_TOOLS[toolName]
      ? null : (
        <MenuItem onClick={() => this.showHideTool(toolName)}>
          { this.state.visibleTool === toolName ? "Hide" : "Show"} {toolLabel}
        </MenuItem>
      )
  }
  showHideTool(toolName) {
    this.setState((oldState) =>
        ({ visibleTool: oldState.visibleTool === toolName ? this.defaultTool : toolName }))
  }
  handleToolClose() {
    this.setState({ visibleTool: this.defaultTool })
  }
  get defaultTool() {
    return this.props.campaign.can_manage ? "map" : "";
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
        { this.props.campaign.can_manage && this.renderTimeForm() }
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
  return Object.assign({}, state);
}
export default connect(mapState)(CampaignView)
