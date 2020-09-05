import * as React from "react"
import { connect } from 'react-redux';

import HexGridGeometry from "./HexGridGeometry"
import { mapEventEmitter } from "./stores"

export class HexGridCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      geometry: null
    }
    this.boundBackgroundRedrawHandler = this.handleBackgroundRedraw.bind(this)
    this.boundWindowResizeHandler = this.handleWindowResize.bind(this)
  }
  static defaultProps = {
    center: [ 0, 0, 0, 0 ],
    onGeometryChange: function() {},
    type: "grid",
    zoom: 0
  }
  static getDerivedStateFromProps(props, state) {
    var stateChanged = false;
    var newState = {}
    if (state.geometry) {
      if (zoomToHexSize(props.zoom) !== state.geometry.hexSize ||
          !arraysEqual(state.geometry.center, props.center)) {
        newState.geometry = null;
        stateChanged = true;
      }
    }
    if (props.dragGesture !== state.dragGesture) {
      newState.dragGesture = props.dragGesture;
      stateChanged = true;
    }
    if (props.type === "grid" && !state.bgDataLoaded && props.bgMap) {
      newState.bgDataLoaded = true;
      newState.geometry = null;  // Force redraw.
      stateChanged = true;
    }
    return stateChanged ? newState : null;
  }
  componentDidMount() {
    window.addEventListener("resize", this.boundWindowResizeHandler)
    mapEventEmitter.on("bgUpdate", this.boundBackgroundRedrawHandler)
    this.rescaleCanvas()
    this.refresh(true)
  }
  componentWillUnmount() {
    window.addEventListener("resize", this.boundWindowResizeHandler)
    mapEventEmitter.off("bgUpdate", this.boundBackgroundRedrawHandler)
  }
  componentDidUpdate() {
    this.refresh()
  }
  render() {
    return (
      <canvas className={this.props.className} ref="canvas"></canvas>
    )
  }
  handleWindowResize() {
    if (this.rescaleCanvas()) {
      this.refresh(true);
    }
  }
  handleBackgroundRedraw(hexPosition) {
    this.drawOneHex(hexPosition)
  }
  refresh(geometryChanged) {
    this.setState((oldState) => {
      var newGeometry;
      if (geometryChanged || !oldState.geometry) {
        newGeometry = new HexGridGeometry({
          hexSize: zoomToHexSize(this.props.zoom),
          center: this.props.center.slice(),
          width: this.refs.canvas.width,
          height: this.refs.canvas.height
        })
        this.props.onGeometryChange(newGeometry)
      }
      if (geometryChanged || !oldState.geometry || this.props.type === "gesture") {
        this.clearCanvas()
        if (this.props.type === "gesture") {
          if (this.state.dragGesture) {
            this.state.dragGesture.draw(this.refs.canvas, newGeometry || oldState.geometry)
          }
        }
        else {
          this.drawGrid(newGeometry)
        }
      }
      return newGeometry ? { geometry: newGeometry } : null;
    })
  }
  rescaleCanvas() {
    // Maintain 1-1 scale of all canvases despite window resizes.
    let resized = false;
    const canvas = this.refs.canvas;
    if (canvas.height != canvas.clientHeight) {
      canvas.height = canvas.clientHeight;
      resized = true;
    }
    if (canvas.width != canvas.clientWidth) {
      canvas.width = canvas.clientWidth;
      resized = true;
    }
    return resized;
  }
  clearCanvas() {
    const canvas = this.refs.canvas;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawGrid(geometry) {
    const canvas = this.refs.canvas;
    const context = canvas.getContext("2d");

    // Fill in background colors.
    geometry.traceGrid((hex) => {
      const bgValue = this.getBackgroundFill(hex)
      if (bgValue) {
        context.beginPath();
        hex.describe((x, y, index) => {
          context[index == 0 ? "moveTo" : "lineTo"](x, y);
        })
        context.fillStyle = bgValue;
        context.fill();
      }
    })

    // Draw the entire grid in a single stroke.
    this.putLineStylesIntoContext(context)
    context.beginPath();
    geometry.traceGrid((hex, stripeCount, cellCount) => {
      hex.describe((x, y, index) => {
        // Don't retrace lines.
        let noLine = (index == 0) || (stripeCount && (index == 2 || index == 3)) || (cellCount && index == 4);
        context[noLine ? "moveTo" : "lineTo"](x, y);
      })
    })
    context.stroke();
  }
  drawOneHex(hexPos) {
    const canvas = this.refs.canvas;
    const context = canvas.getContext("2d");
    const savedGlobalCompositeOperation = context.globalCompositeOperation;
    this.putLineStylesIntoContext(context)
    context.beginPath();
    this.state.geometry.locateHex(hexPos).describe((x, y, index) => {
      context[index == 0 ? "moveTo" : "lineTo"](x, y);
    })
    const fillStyle = this.getBackgroundFill(hexPos);
    if (fillStyle) {
      context.fillStyle = fillStyle;
    }
    else {
      // Clear the hex.
      context.globalCompositeOperation = "destination-out";
    }
    context.fill();
    context.globalCompositeOperation = savedGlobalCompositeOperation;
    context.stroke();
  }
  getBackgroundFill(hex) {
    return this.props.bgMap && this.props.bgMap.getBgValue(hex.row, hex.col)
  }
  putLineStylesIntoContext(context) {
    context.lineWidth = 1;
    context.strokeStyle = "rgb(200,200,200)";
  }
}

function zoomToHexSize(zoom) {
  switch (zoom || 0) {
  case 0:
    return 30;
  case 1:
    return 25;
  default:
    return 20;
  }
}

function arraysEqual(a1, a2) {
  if (a1.length !== a2.length) return false;
  for (var i = 0; i < a1.length; ++i) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

export default HexGridCanvas;
