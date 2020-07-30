import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import Map from "./Map"
import MapToolbox from "./MapToolbox"
import "./ActionView.css"


function tfmt(n) {
  if (n < 0 || n > 99) return "??"
  n = Math.floor(n)
  return (n < 10 ? "0" : "") + n
}

export class ActionView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timeCardShown: false,
      meleeCardShown: false,
      locationCardShown: false,
      locationInput: ""
    }
  }
  render() {
    return (
      <div className="ActionView">
        <div className="infobar">
          { this.renderMeleeTab(this.props.currentMelee) }
          { this.renderTimeTab() }
          { this.renderLocationTab() }
          { !!this.props.campaign.can_manage && <MapToolbox/> }
        </div>
        <Map/>
      </div>
    )
  }
  handleUseCounter() {
    this.setState((oldState) => ({
      mapToolboxState:
          Object.assign({}, oldState.mapToolboxState,
          { counterValue: oldState.mapToolboxState.counterValue + 1 })
    }))
  }
  handleMapToolboxChange(newState) {
    this.setState({ mapToolboxState: newState })
  }
  renderMeleeTab(m) {
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("meleeCardShown")}>
          { !m && <div>(No melee)</div> }
          { !!m && (
            <span>
              <span className="label">Round</span> <span className="roundValue">{m.round}</span>
              <span>&nbsp;</span>
              <span className="whoValue">{m.who}</span>
            </span>
          )}
          <i className="material-icons">
            { this.state.meleeCardShown ? "unfold_less" : "unfold_more" }
          </i>
        </div>
        { this.state.meleeCardShown && this.renderMeleeCard(m) }
      </div>
    )
  }
  renderTimeTab() {
    let t = null;
    try {
      t = this.props.campaignNotes.notes.time.json;
    }
    catch (e) {
      // Not there.
    }
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("timeCardShown")}>
          <span className="label">Day</span> <span className="dayValue">{(!!t && t.day) || 0}</span>
          <span>&nbsp;</span>
          { !!t && <span className="timeValue">{tfmt(t.hour)}:{tfmt(t.minute)}:{tfmt(t.second)}</span> }
          { this.props.campaign.can_manage && <i className="material-icons">
              { this.state.timeCardShown ? "unfold_less" : "unfold_more" }
            </i> }
        </div>
        { this.props.campaign.can_manage && this.state.timeCardShown && this.renderTimeCard() }
      </div>
    )
  }
  renderLocationTab() {
    let l = null;
    try {
      console.log(this.props.campaignNotes.notes)
      l = this.props.campaignNotes.notes.location.text;
    }
    catch (e) {
      // Not there.
    }
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("locationCardShown")}>
          { !!l && <span className="whereValue">{l}</span> }
          { !l && <span>(No location set)</span> }
          <i className="material-icons">
            { this.state.locationCardShown ? "unfold_less" : "unfold_more" }
          </i>
        </div>
        { this.state.locationCardShown && this.renderLocationCard() }
      </div>
    )
  }
  renderTimeCard() {
    return (
      <div className="card">
      </div>
    )
  }
  renderMeleeCard(m) {
    return (<div className="card">PLACEHOLDER</div>)
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
  handleLocationInputChange(event) {
    const locationInputValue = event.target.value;
    this.setState({ locationInput: locationInputValue })
  }
  handleLocationFormSubmit(event) {
    event.preventDefault();
    this.props.dispatch({ type: actions.CREATE_NOTE, data: {
      topic: "location", text: this.state.locationInput
    }})
    this.setState({ locationCardShown: false, locationInput: "" })
  }
  handleNoteFormSubmit(event) {
    event.preventDefault();
    this.setState({ locationCardShown: false, timeCardShown: false, meleeCardShown: false });
    console.log(event, event.target);
    this.props.dispatch({ type: actions.CREATE_NOTE, data: event.form })
  }
  toggleState(key) {
    this.setState((oldState) => {
      const result = {}
      result[key] = !oldState[key]
      return result;
    })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(ActionView)
