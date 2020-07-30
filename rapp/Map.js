import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import { mapEventEmitter } from "./stores"
import HexGridRenderer from "./HexGridRenderer"
import Token from "./Token"
import { TokenSelectHalo } from "./Token"
import "./Map.css"


export class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dragGesture: null,
      hoverHex: null,
      selectedToken: null
    }
    this.initialDraw = false;
    this.boundWindowResizeHandler = this.handleWindowResize.bind(this)
    this.boundBackgroundRedrawHandler = this.handleBackgroundRedraw.bind(this)
    this.boundKeyPressHandler = this.handleKeyPress.bind(this)
  }
  static getDerivedStateFromProps(props, state) {
    // If the selected token is deleted, remove the halo.
    if (state.selectedToken &&
        !props.tokens.find((token) => token.uuid == state.selectedToken.uuid)) {
      return { selectedToken: null }
    }
    return null;
  }
  componentDidMount() {
    window.addEventListener("resize", this.boundWindowResizeHandler)
    document.addEventListener("keydown", this.boundKeyPressHandler)
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
    document.removeEventListener("keydown", this.boundKeyPressHandler)
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
      <div className={`Map ${this.selectedToolType}`}
          onClick={(event) => this.handleClick(event)}
          onMouseEnter={(event) => this.handleMouseEnter(event)}
          onMouseLeave={(event) => this.handleMouseLeave(event)}
          onMouseMove={(event) => this.handleMouseMove(event)}
          onMouseDown={(event) => this.handleMouseDown(event)}
          onMouseUp={(event) => this.handleMouseUp(event)}>
        <canvas className="layer" key="backgroundCanvas" ref="backgroundCanvas"></canvas>
        <canvas className="layer" key="gestureCanvas" ref="gestureCanvas"></canvas>
        <div className="layer">
          { (this.props.tokens || []).map((token) =>
            <Token key={token.uuid} token={token}
                onClick={(event) => this.handleTokenClick(event)}/>) }
          { this.state.selectedToken && <TokenSelectHalo token={this.state.selectedToken}/> }
        </div>
        { this.selectedToolType == "info" && !!this.state.hoverHex &&
          this.renderHexInfo(this.state.hoverHex) }
      </div>
    )
  }
  renderHexInfo(hex) {
    return (
      <div style={{
        position: "absolute",
        top: `${hex.cy}px`,
        left: `${hex.cx}px`,
        border: "solid 1px black",
        borderRadius: "5px",
        padding: "2px",
        backgroundColor: "yellow",
        color: "black",
        fontSize: "12px"
      }}>
        { hex.row }:{ hex.col }
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
    this.endDrag(true)
    this.setState({ hoverHex: null })
  }
  handleMouseMove(event) {
    const hex = this.getBoundingHexOfEvent(event)
    if (!hexesEqual(hex, this.state.hoverHex)) {
      this.state.dragGesture && this.state.dragGesture.enterHex(hex);
      this.setState({ hoverHex: hex })
    }
  }
  handleMouseDown(event) {
    const hex = this.getBoundingHexOfEvent(event)
    if (hex) {
      switch (this.selectedToolType) {
      case "grabber":
        const tokenUuid = this.eventGetTokenUuid(event);
        if (tokenUuid) {
          this.setState({ dragGesture: new TokenMoveGesture(this, tokenUuid).start(hex) })
        }
        break;
      case "bg":
        this.setState({ dragGesture: new BackgroundPaintGesture(this, this.selectedToolValue).start(hex) })
        break;
      case "counter":
        this.dropCounterOnHex(hex)
        break;
      case "token":
        this.dropTokenOnHex(hex)
        break;
      }
    }
  }
  handleMouseUp(event) {
    this.endDrag()
  }
  handleClick(event) {
    if (this.selectedToolType == "grabber") {
      const tokenUuid = this.eventGetTokenUuid(event);
      if (tokenUuid) {
        this.setState({ selectedToken: this.props.tokens.find((ele) => ele.uuid == tokenUuid) })
        return;
      }
    }
    this.setState({ selectedToken: null });
  }
  handleKeyPress(event) {
    if (event.key == "Backspace" && this.state.selectedToken) {
      this.props.dispatch({ type: actions.DELETE_TOKEN, props: this.state.selectedToken })
      this.setState({ selectedToken: null })
    }
  }
  eventGetTokenUuid(event) {
    if (event.target.className == "Token") {
      return event.target.getAttribute("data-uuid")
    }
  }
  get selectedToolType() {
    return this.props.selectedTool && this.props.selectedTool.split("|")[0]
  }
  get selectedToolValue() {
    if (this.props.selectedTool) {
      const parts = this.props.selectedTool.split("|")
      return parts.length > 1 && parts[1]
    }
  }
  getBoundingHexOfEvent(event) {
    return new HexGridRenderer(this.refs.gestureCanvas).getBoundingHex(Map.eventPoint(event))
  }
  clearAllFeedback() {
    new HexGridRenderer(this.refs.gestureCanvas).clear()
  }
  assignBackgroundColorToHex(hex, color) {
    this.props.dispatch({ type: actions.SET_BACKGROUND, props: {
      author: true, hex: hex, value: color
    }})
  }
  dropCounterOnHex(hex, color) {
    this.props.dispatch({
      type: actions.PLACE_COUNTER,
      props: { hex, fillStyle: this.selectedToolValue }
    })
  }
  dropTokenOnHex(hex, color) {
    this.props.dispatch({
      type: actions.PLACE_TOKEN,
      props: { hex, value: `,${this.selectedToolValue}` }
    })
  }
  endDrag(isCancelled = false) {
    if (!isCancelled && this.state.dragGesture) {
      this.state.dragGesture.terminate();
    }
    this.clearAllFeedback()
    this.setState({ dragGesture: null })
  }
  static eventPoint(event) {
    var rect = event.currentTarget.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x, y }
  }
}

class DragGesture {
  constructor(mapComponent) {
    this.mapComponent = mapComponent;
  }
  start(hex) {
    return this.enterHex(hex)
  }
  enterHex(hex) {
    return this;
  }
  terminate() {
  }
}

class BackgroundPaintGesture extends DragGesture {
  constructor(mapComponent, fillStyle) {
    super(mapComponent)
    this.fillStyle = fillStyle;
  }
  enterHex(hex) {
    this.mapComponent.assignBackgroundColorToHex(hex, this.fillStyle)
    return this;
  }
}

class TokenMoveGesture extends DragGesture {
  constructor(mapComponent, tokenUuid) {
    super(mapComponent)
    this.tokenUuid = tokenUuid;
  }
  start(hex) {
    this.sourceHex = hex;
    this.destHex = null;
    return this;
  }
  enterHex(hex) {
    this.destHex = hex;
    this.draw();
    return this;
  }
  terminate() {
    if (this.destHex && !hexesEqual(this.sourceHex, this.destHex)) {
      this.mapComponent.props.dispatch({ type: actions.MODIFY_TOKEN, props: {
        uuid: this.tokenUuid,
        position: `${this.destHex.row}:${this.destHex.col}`
      }})
    }
  }
  draw() {
    if (this.destHex && !hexesEqual(this.sourceHex, this.destHex)) {
      new HexGridRenderer(this.mapComponent.refs.gestureCanvas, {
        strokeStyle: "red",
        lineWidth: 2
      }).clear().drawHex(this.destHex)
    }
  }
}

function hexesEqual(h1, h2) {
  return (!!h1 == !!h2) && (!h1 || (h1.row == h2.row && h1.col == h2.col))
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(Map)
