import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import HexGridRenderer from "./HexGridRenderer"
import "./ActionView.css"


function tfmt(n) {
  if (n < 0 || n > 99) return "??"
  n = Math.floor(n)
  return (n < 10 ? "0" : "") + n
}

function eventPoint(event) {
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return { x, y }
}

export class ActionView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timeCardShown: false,
      meleeCardShown: false,
      locationCardShown: false
    }
    this.boundUpdateCanvas = this.updateCanvas.bind(this)
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
    this.updateCanvas()
    window.addEventListener("resize", this.boundUpdateCanvas)
  }
  componentDidUpdate() {
  }
  componentWillUnmount() {
    window.addEventListener("resize", this.boundUpdateCanvas)
  }
  updateCanvas() {
    this.resizeCanvas()
    this.scheduleCanvasRedraw()
  }
  resizeCanvas() {
    [
      this.refs.backgroundCanvas,
      this.refs.foregroundCanvas,
      this.refs.feedbackCanvas,
      this.refs.gestureCanvas
    ].forEach((canvas) => {
      canvas.height = canvas.clientHeight;
      canvas.width = canvas.clientWidth;
    })
  }
  scheduleCanvasRedraw() {
    const self = this
    if (this.redrawTimeout) {
      clearTimeout(this.redrawTimeout);
    }
    this.redrawTimeout = setTimeout(() => {
      self.redrawCanvas()
    }, 400)
  }
  redrawCanvas() {
    new HexGridRenderer(this.refs.backgroundCanvas).clear().drawGrid()
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
        </div>
        <div className="canvasContainer">
          <canvas ref="backgroundCanvas"></canvas>
          <canvas ref="foregroundCanvas"></canvas>
          <canvas ref="feedbackCanvas"></canvas>
          <canvas ref="gestureCanvas"
            onMouseEnter={(event) => this.handleMouseEnter(event)}
            onMouseLeave={(event) => this.handleMouseLeave(event)}
            onMouseMove={(event) => this.handleMouseMove(event)}
            onMouseDown={(event) => this.handleMouseDown(event)}
            onMouseUp={(event) => this.handleMouseUp(event)}
            ></canvas>
        </div>
      </div>
    )
  }
  handleMouseEnter(event) {
    this.handleMouseMove(event)
  }
  handleMouseLeave(event) {
    new HexGridRenderer(this.refs.feedbackCanvas).clear()
  }
  handleMouseMove(event) {
    console.log('drawBoundingHex', event)
    //new HexGridRenderer(this.refs.feedbackCanvas).clear().drawBoundingHex(eventPoint(event))
    new HexGridRenderer(this.refs.feedbackCanvas, {
      strokeStyle: "rgb(200,0,0)"
    }).clear().drawBoundingHex(eventPoint(event))
  }
  handleMouseDown(event) {
  }
  handleMouseUp(event) {
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
