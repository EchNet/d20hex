import * as React from "react"
import { connect } from 'react-redux';

import { HexGridGeometry } from "./HexGridRenderer"

export class Token extends React.Component {
  render() {
    const token = this.props.token;
    const valueParts = token.value.split(",")
    const label = valueParts[0];
    const digits = label.length;
    const fillStyle = valueParts[1];
    const geometry = new HexGridGeometry();
    const tokenDiameter = geometry.unitDistance;
    const positionParts = token.position.split(":")
    let hex = geometry.locateHex({ row: positionParts[0], col: positionParts[1] });
    return (
      <div className="Token" data-uuid={token.uuid}
          style={{
              position: "absolute",
              top: `${hex.cy - tokenDiameter/2}px`,
              left: `${hex.cx - tokenDiameter/2}px`,
              color: "white",
              background: fillStyle,
              backgroundSize: "cover",
              width: `${tokenDiameter}px`,
              height: `${tokenDiameter}px`,
              paddingTop: `${tokenDiameter * digits/8 - 1}px`,
              lineHeight: `${tokenDiameter * (4-digits)/4}px`,
              borderRadius: "50%",
              fontSize: `${tokenDiameter * (4-digits)/4}px`,
              textAlign: "center"
          }}
        onMouseMove={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
        >{ label }</div>
    )
  }
}

export class TokenSelectHalo extends React.Component {
  render() {
    const token = this.props.token;
    const geometry = new HexGridGeometry();
    const tokenDiameter = geometry.unitDistance;
    const GAP = 2;
    const THICKNESS = 3;
    const haloDiameter = tokenDiameter + (GAP*2) + (THICKNESS*2);
    const positionParts = token.position.split(":")
    let hex = geometry.locateHex({ row: positionParts[0], col: positionParts[1] })
    return (
      <div className="TokenSelectHalo" data-uuid={token.uuid}
          style={{
              position: "absolute",
              top: `${hex.cy - haloDiameter/2}px`,
              left: `${hex.cx - haloDiameter/2}px`,
              width: `${haloDiameter}px`,
              height: `${haloDiameter}px`,
              borderRadius: "50%",
              border: `solid ${THICKNESS}px rgba(196,196,255,0.75)`
          }}
        ></div>
    )
  }
}

export default Token
