import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import HexGridRenderer from "./HexGridRenderer"
import "./Map.css"


export class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.dragging = false;
    this.hoverHex = null;
    this.boundResizeHandler = this.handleResize.bind(this)
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_MAP })
    this.updateCanvasIfMapReady()
    window.addEventListener("resize", this.boundResizeHandler)
  }
  componentDidUpdate() {
    this.updateCanvasIfMapReady()
  }
  componentWillUnmount() {
    window.addEventListener("resize", this.boundResizeHandler)
  }
  updateCanvasIfMapReady() {
    if (this.props.map && !this.drawn) {
      this.scheduleCanvasRedraw()
      this.drawn = true;
    }
  }
  handleResize() {
    this.drawn = false;
    this.updateCanvasIfMapReady()
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
      this.resizeCanvas()
      self.redrawCanvas()
    }, 400)
  }
  redrawCanvas() {
    new HexGridRenderer(this.refs.backgroundCanvas, {
      bgMap: new BgMap(this.props.map.bg)
    }).drawGrid()
  }
  render() {
    return (
      <div className="Map">
        <canvas key="backgroundCanvas" ref="backgroundCanvas"></canvas>
        <canvas key="foregroundCanvas" ref="foregroundCanvas"></canvas>
        <canvas key="feedbackCanvas" ref="feedbackCanvas"></canvas>
        <canvas key="gestureCanvas" ref="gestureCanvas"
          onMouseEnter={(event) => this.handleMouseEnter(event)}
          onMouseLeave={(event) => this.handleMouseLeave(event)}
          onMouseMove={(event) => this.handleMouseMove(event)}
          onMouseDown={(event) => this.handleMouseDown(event)}
          onMouseUp={(event) => this.handleMouseUp(event)}
          ></canvas>
        { !!this.state.infoHex && this.renderHexInfo(this.state.infoHex) }
      </div>
    )
  }
  renderHexInfo(infoHex) {
    return (
      <div style={{
        position: "absolute",
        top: `${infoHex.cy}px`,
        left: `${infoHex.cx}px`,
        border: "solid 1px black",
        borderRadius: "5px",
        padding: "2px",
        backgroundColor: "yellow",
        color: "black",
        fontSize: "12px"
      }}>
        { infoHex.row }:{ infoHex.col }
      </div>
    )
  }
  handleMouseEnter(event) {
    this.handleMouseMove(event)
  }
  handleMouseLeave(event) {
    this.clearAllFeedback()
    this.setState({ infoHex: null })
    this.dragging = false;
    this.hoverHex = null;
  }
  handleMouseMove(event) {
    this.clearAllFeedback()
    const hex = this.getBoundingHexOfEvent(event)
    if (!hexesEqual(hex, this.hoverHex)) {
      this.handleHexTransition(hex)
    }
    this.hoverHex = hex;
  }
  handleHexTransition(hex) {
    let infoHex = null;
    switch (this.selectedTool[0]) {
    case "bg":
      if (this.dragging && hex) {
        this.assignColorToHex(hex, this.selectedTool[1])
      }
      break;
    case "grabber":
      if (hex) {
        new HexGridRenderer(this.refs.feedbackCanvas, { strokeStyle: "orange" }).drawHex(hex)
      }
      break;
    case "info":
      if (hex) {
        infoHex = hex;
      }
      break;
    }
    this.setState({ infoHex })
  }
  handleMouseDown(event) {
    const selectedTool = this.selectedTool;
    if (selectedTool[0] == "bg") {
      const hex = this.getBoundingHexOfEvent(event)
      if (hex) {
        this.dragging = true;
        this.assignColorToHex(hex, selectedTool[1])
      }
    }
  }
  handleMouseUp(event) {
    this.dragging = false;
  }
  get selectedTool() {
    const toolboxState = this.props.toolboxState;
    if (toolboxState && toolboxState.selectedTool) {
      return toolboxState.selectedTool.split(":")
    }
    return [""]
  }
  getBoundingHexOfEvent(event) {
    return new HexGridRenderer(this.refs.gestureCanvas).getBoundingHex(Map.eventPoint(event))
  }
  clearAllFeedback() {
    new HexGridRenderer(this.refs.feedbackCanvas).clear()
  }
  assignColorToHex(hex, color) {
    new HexGridRenderer(this.refs.backgroundCanvas, { fillStyle: color }).drawHex(hex)
    this.props.dispatch({ type: actions.SET_BACKGROUND, props: {
      key: `${hex.row}:${hex.col}`, author: true, value: color
    }})
  }
  static eventPoint(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x, y }
  }
}
class BgMap {
  constructor(data) {
    this.data = data || {};
  }
  getBgValue(row, col) {
    const key = `${row}:${col}`
    return this.data[key]
  }
}
function hexesEqual(h1, h2) {
  return (!!h1 == !!h2) && (!h1 || (h1.row == h2.row && h1.col == h2.col))
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(Map)
