import * as React from "react"
import { connect } from 'react-redux';

import { HexGridGeometry } from "./HexGridRenderer"

export class Token extends React.Component {
  render() {
    const valueParts = this.props.token.value.split(",")
    const number = valueParts[0];
    const digits = number.length;
    const color = valueParts[1];
    const geometry = new HexGridGeometry();
    const diameter = geometry.unitDistance;
    const positionParts = this.props.token.position.split(":")
    let hex = { row: positionParts[0], col: positionParts[1] }
    geometry.locateHex(hex);
    // TODO: clip
    return (
      <div style={{
              position: "absolute",
              top: `${Math.floor(hex.cy - diameter/2 + 0.5)}px`,
              left: `${Math.floor(hex.cx - diameter/2 + 0.5)}px`,
              color: "white",
              backgroundColor: color,
              width: `${diameter}px`,
              height: `${diameter}px`,
              lineHeight: `${diameter - 4 - digits*2}px`,
              borderRadius: "50%",
              fontSize: `${diameter - 4 - digits*2}px`,
              textAlign: "center"
          }}>{ number }</div>
    )
  }
}

export default Token
