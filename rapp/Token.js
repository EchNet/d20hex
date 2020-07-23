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
    const tokenDiameter = geometry.unitDistance;
    const positionParts = this.props.token.position.split(":")
    let hex = geometry.locateHex({ row: positionParts[0], col: positionParts[1] });
    return (
      <div style={{
              position: "absolute",
              top: `${hex.cy - tokenDiameter/2}px`,
              left: `${hex.cx - tokenDiameter/2}px`,
              color: "white",
              backgroundColor: color,
              width: `${tokenDiameter}px`,
              height: `${tokenDiameter}px`,
              paddingTop: `${tokenDiameter * digits/8 - 1}px`,
              lineHeight: `${tokenDiameter * (4-digits)/4}px`,
              borderRadius: "50%",
              fontSize: `${tokenDiameter * (4-digits)/4}px`,
              textAlign: "center"
          }}>{ number }</div>
    )
  }
}

export default Token
