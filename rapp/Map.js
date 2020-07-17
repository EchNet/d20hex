import * as React from "react"
import { connect } from 'react-redux';

import HexGridRenderer from "./HexGridRenderer"
import "./Map.css"


export class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      toolboxState: null,
    }
    this.boundUpdateCanvas = this.updateCanvas.bind(this)
  }
  componentDidMount() {
    this.updateCanvas()
    window.addEventListener("resize", this.boundUpdateCanvas)
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
      <div className="Map">
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
    )
  }
  handleMouseEnter(event) {
    this.handleMouseMove(event)
  }
  handleMouseLeave(event) {
    new HexGridRenderer(this.refs.feedbackCanvas).clear()
  }
  handleMouseMove(event) {
    new HexGridRenderer(this.refs.feedbackCanvas, {
      strokeStyle: "rgb(200,0,0)"
    }).clear().drawBoundingHex(Map.eventPoint(event))
  }
  handleMouseDown(event) {
  }
  handleMouseUp(event) {
  }
  static eventPoint(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x, y }
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(Map)
