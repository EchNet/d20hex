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
      mapToolboxState: MapToolbox.defaultState(),
      timeCardShown: false,
      meleeCardShown: false,
      locationCardShown: false
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="ActionView">
        <div className="infobar">
          <div>
            { this.renderMeleeTab(this.props.currentMelee) }
          </div>
          <div>
            { this.renderTimeTab(this.props.currentTime) }
          </div>
          <div>
            { this.renderLocationTab(this.props.currentLocation) }
          </div>
          <MapToolbox onChange={(event) => this.handleMapToolboxChange(event)}/>
        </div>
        <Map toolboxState={this.state.mapToolboxState}/>
      </div>
    )
  }
  handleMapToolboxChange(newState) {
    console.log(newState)
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
  renderTimeTab(t) {
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
        { this.state.timeCardShown && this.renderTimeCard(t) }
      </div>
    )
  }
  renderLocationTab(l) {
    return (
      <div className="tabCardContainer">
        <div className="tab" onClick={() => this.toggleState("locationCardShown")}>
          { !!l && <span className="whereValue">{l.shortName}</span> }
          { !l && <span>(No location set)</span> }
          <i className="material-icons">
            { this.state.timeCardShown ? "unfold_less" : "unfold_more" }
          </i>
        </div>
        { this.state.locationCardShown && this.renderLocationCard(l) }
      </div>
    )
  }
  renderTimeCard(t) {
    return (<div className="card">PLACEHOLDER</div>)
  }
  renderMeleeCard(m) {
    return (<div className="card">PLACEHOLDER</div>)
  }
  renderLocationCard(l) {
    return (<div className="card">PLACEHOLDER</div>)
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
