import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import { mapEventEmitter } from "./stores"
import HexGridRenderer from "./HexGridRenderer"
import Token from "./Token"
import "./Map.css"


export class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.initialDraw = false;
    this.dragging = false;
    this.hoverHex = null;
    this.boundWindowResizeHandler = this.handleWindowResize.bind(this)
    this.boundBackgroundRedrawHandler = this.handleBackgroundRedraw.bind(this)
  }
  componentDidMount() {
    window.addEventListener("resize", this.boundWindowResizeHandler)
    mapEventEmitter.on("bgUpdate", this.boundBackgroundRedrawHandler)
    if (this.props.bgMap) {
      this.rescaleCanvas()
      this.drawBackground()
      this.initialDraw = true;
    }
    else {
      // Trigger loading of map data as needed.
      this.props.dispatch({ type: actions.WANT_MAP })
    }
  }
  componentDidUpdate() {
    if (!this.initialDraw && this.props.bgMap) {
      this.rescaleCanvas()
      this.drawBackground()
      this.initialDraw = true;
    }
  }
  componentWillUnmount() {
    window.addEventListener("resize", this.boundWindowResizeHandler)
    mapEventEmitter.off("bgUpdate", this.boundBackgroundRedrawHandler)
  }
  rescaleCanvas() {
    // Maintain 1-1 scale of all canvases despite window resizes.
    let resized = false;
    [
      this.refs.backgroundCanvas,
      this.refs.gestureCanvas
    ].forEach((canvas) => {
      if (canvas) {
        if (canvas.height != canvas.clientHeight) {
          canvas.height = canvas.clientHeight;
          resized = true;
        }
        if (canvas.height != canvas.clientWidth) {
          canvas.width = canvas.clientWidth;
          resized = true;
        }
      }
    })
    return resized;
  }
  drawBackground() {
    new HexGridRenderer(this.refs.backgroundCanvas, {
      bgMap: this.props.bgMap
    }).clear().drawGrid()
  }
  renderOneBackgroundHex(hex) {
    new HexGridRenderer(this.refs.backgroundCanvas, {
      bgMap: this.props.bgMap
    }).drawHex(hex)
  }
  render() {
    return (
      <div className="Map">
        <canvas className="layer" key="backgroundCanvas" ref="backgroundCanvas"></canvas>
        <div className="layer">
          { this.props.tokens &&
            this.props.tokens.map((token) => <Token key={token.uuid} token={token}/>) }
        </div>
        <canvas className="layer" key="gestureCanvas" ref="gestureCanvas"
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
  handleWindowResize() {
    if (this.rescaleCanvas()) {
      this.drawBackground();
      this.initialDraw = true;
    }
  }
  handleBackgroundRedraw(hex) {
    this.renderOneBackgroundHex(hex)
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
    const hex = this.getBoundingHexOfEvent(event)
    if (hex) {
      switch (selectedTool[0]) {
      case "bg":
        this.dragging = true;
        this.assignColorToHex(hex, selectedTool[1])
        break;
      case "counter":
        this.dropCounterOnHex(hex)
      }
    }
  }
  handleMouseUp(event) {
    this.dragging = false;
  }
  get selectedTool() {
    if (this.props.selectedTool) {
      return this.props.selectedTool.split(":")
    }
    return [""]
  }
  getBoundingHexOfEvent(event) {
    return new HexGridRenderer(this.refs.gestureCanvas).getBoundingHex(Map.eventPoint(event))
  }
  clearAllFeedback() {
    new HexGridRenderer(this.refs.gestureCanvas).clear()
  }
  assignColorToHex(hex, color) {
    this.props.dispatch({ type: actions.SET_BACKGROUND, props: {
      author: true, hex: hex, value: color
    }})
  }
  dropCounterOnHex(hex, color) {
    this.props.dispatch({ type: actions.PLACE_COUNTER, props: { hex }})
  }
  static eventPoint(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x, y }
  }
}
function hexesEqual(h1, h2) {
  return (!!h1 == !!h2) && (!h1 || (h1.row == h2.row && h1.col == h2.col))
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(Map)
