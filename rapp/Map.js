import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import HexGridCanvas from "./HexGridCanvas"
import { HexGridPath } from "./HexGridRenderer"
import Token from "./Token"
import "./Map.css"

export class Map extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      center: props.center,
      dragGesture: null,
      hoverHex: null,
      selectedToken: null,
      dirty: true
    }
    this.boundKeyPressHandler = this.handleKeyPress.bind(this)
  }
  static defaultProps = {
    zoom: 0,
    center: [8, 16, 0, 0],
    selectedTool: "",
    tokens: []
  }
  static getDerivedStateFromProps(props, state) {
    // If the selected token is deleted, remove the halo.
    if (state.selectedToken &&
        !props.tokens.find((token) => token.uuid == state.selectedToken.uuid)) {
      return { selectedToken: null, dragGesture: null }
    }
    return null;
  }
  componentDidMount() {
    document.addEventListener("keydown", this.boundKeyPressHandler)
    // Trigger loading of map data as needed.
    this.props.dispatch({ type: actions.WANT_MAP })
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.boundKeyPressHandler)
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
        <HexGridCanvas className="layer"
            zoom={this.props.zoom} center={this.state.center}
            bgMap={this.props.bgMap}
            onGeometryChange={(geometry) => this.setState({ geometry })}/>
        <HexGridCanvas className="layer" type="gesture"
            zoom={this.props.zoom} center={this.state.center}
            dragGesture={this.state.dragGesture}/>
        <div className="layer">
          { (this.props.tokens || []).map((token) =>
            <Token key={token.uuid} token={token}
                geometry={this.state.geometry}
                selected={this.state.selectedToken == token}
                onClick={(event) => this.handleTokenClick(event)}/>) }
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
        top: "5px",
        right: "5px",
        border: "solid 1px black",
        borderRadius: "5px",
        padding: "2px",
        backgroundColor: "yellow",
        color: "black",
        fontSize: "12px"
      }}>
        { hex.row }:{ hex.col }:{ hex.xoffset }:{ hex.yoffset }
      </div>
    )
  }
  get hexSize() {
    return this.state.geometry.hexSize;
  }
  handleMouseEnter(event) {
    this.handleMouseMove(event)
  }
  handleMouseLeave(event) {
    this.endDrag(true)
    this.setState({ hoverHex: null })
  }
  handleMouseMove(event) {
    var hoverHex = this.getBoundingHexOfEvent(event)
    var dragGesture = this.state.dragGesture;
    if (!!dragGesture && !hexesEqual(hoverHex, this.state.hoverHex)) {
      dragGesture = dragGesture.enterHex(hoverHex);
    }
    this.setState({ hoverHex, dragGesture })
  }
  handleMouseDown(event) {
    const hex = this.getBoundingHexOfEvent(event)
    if (hex) {
      switch (this.selectedToolType) {
      case "grabber":
        const tokenUuid = this.eventGetTokenUuid(event);
        if (tokenUuid) {
          const token = this.props.tokens.find((ele) => ele.uuid == tokenUuid)
          this.setState({ dragGesture: new TokenMoveGesture(this, token, hex) })
        }
        break;
      case "recenter":
        this.setState({ center: [ hex.row, hex.col, hex.xoffset, hex.yoffset ] })
        break;
      case "bg":
        this.setState({ dragGesture: new BackgroundPaintGesture(this, this.selectedToolValue, hex) })
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
    return this.state.geometry.getBoundingHex(Map.eventPoint(event));
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
      this.state.dragGesture.complete();
    }
    this.setState({ dragGesture: null })
  }
  static eventPoint(event) {
    var rect = event.currentTarget.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x, y }
  }
}

class BackgroundPaintGesture {
  constructor(mapComponent, fillStyle, hex) {
    this.mapComponent = mapComponent;
    this.fillStyle = fillStyle;
    this.assignBackgroundColorToHex(hex);
  }
  enterHex(hex) {
    this.assignBackgroundColorToHex(hex);
    return this;
  }
  assignBackgroundColorToHex(hex) {
    this.mapComponent.assignBackgroundColorToHex(hex, this.fillStyle)
  }
  draw() {}
  complete() {}
}

class TokenMoveGesture {
  constructor(mapComponent, token, pathInfo) {
    this.mapComponent = mapComponent;
    this.token = token;
    this.path = pathInfo.row != null ? new HexGridPath(pathInfo) : pathInfo;
  }
  enterHex(hex) {
    var copy = this.clone();
    copy.path.add(hex);
    return copy;
  }
  clone() {
    return new TokenMoveGesture(this.mapComponent, this.token, this.path)
  }
  complete() {
    if (this.path.length > 1) {
      this.mapComponent.props.dispatch({ type: actions.MODIFY_TOKEN, props: {
        uuid: this.token.uuid,
        position: this.path.endHexString
      }})
    }
    else {
      this.mapComponent.setState({ selectedToken: this.token })
    }
  }
  draw(canvas, geometry) {
    this.path.draw(canvas, geometry)
  }
}

function hexesEqual(h1, h2) {
  return (!!h1 == !!h2) && (!h1 || (h1.row == h2.row && h1.col == h2.col))
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(Map)
