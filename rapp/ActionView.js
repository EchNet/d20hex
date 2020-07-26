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
      locationCardShown: false
    }
  }
  render() {
    return (
      <div className="ActionView">
        <div className="infobar">
          <div>
            { this.renderMeleeTab(this.props.currentMelee) }
          </div>
          <div>
            { this.renderTimeTab() }
          </div>
          <div>
            { this.renderLocationTab() }
          </div>
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
    const t = this.props.campaignNotes && this.props.campaignNotes.notes && this.props.campaignNotes.notes.time;
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("timeCardShown")}>
          <span className="label">Day</span> <span className="dayValue">{(!!t && t.day) || 0}</span>
          <span>&nbsp;</span>
          { !!t && <span className="timeValue">{tfmt(t.hour)}:{tfmt(t.minute)}:{tfmt(t.second)}</span> }
          <i className="material-icons">
            { this.state.timeCardShown ? "unfold_less" : "unfold_more" }
          </i>
        </div>
        { this.state.timeCardShown && this.renderTimeCard() }
      </div>
    )
  }
  renderLocationTab() {
    const l = this.props.campaignNotes && this.props.campaignNotes.notes && this.props.campaignNotes.notes.location;
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("locationCardShown")}>
          { !!l && <span className="whereValue">{l.shortName}</span> }
          { !l && <span>(No location set)</span> }
          <i className="material-icons">
            { this.state.locationCardShown ? "unfold_less" : "unfold_more" }
          </i>
        </div>
        { this.state.locationCardShown && this.renderLocationCard(l) }
      </div>
    )
  }
  renderTimeCard() {
    return (
      <div className="card">
        { this.renderNoteForm("time") }
      </div>
    )
  }
  renderMeleeCard(m) {
    return (<div className="card">PLACEHOLDER</div>)
  }
  renderLocationCard() {
    return (
      <div className="card">
        { this.renderNoteForm("location") }
      </div>
    )
  }
  renderNoteForm(topic) {
    return (
      <div className="noteForm">
        <form onSubmit={(event) => this.handleNoteFormSubmit(topic, event)}>
          <div>Topic: {topic}</div>
          <input type="hidden" name="topic" value={topic} />
          <div><textarea name="json"/></div>
          <div><textarea name="text"/></div>
          <input type="submit"/>
        </form>
      </div>
    )
  }
  handleNoteFormSubmit(event) {
    event.preventDefault();
    this.setState({ locationCardShown: false, timeCardShown: false, meleeCardShown: false });
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
