import * as React from "react"
import { connect } from 'react-redux';

const HALO_GAP = 2;
const HALO_THICKNESS = 3;

export class Token extends React.Component {
  render() {
    const token = this.props.token;
    const valueParts = token.value.split(",")
    const label = valueParts[0];
    const digits = label.length;
    const fillStyle = valueParts[1];
    const tokenDiameter = this.props.geometry.unitDistance;
    const haloDiameter = tokenDiameter + (HALO_GAP*2) + (HALO_THICKNESS*2);
    const positionParts = token.position.split(":")
    let hex = this.props.geometry.locateHex({ row: positionParts[0], col: positionParts[1] });
    return (
      <div className="TokenHalo"
          style={{
              position: "absolute",
              top: `${hex.cy - haloDiameter/2}px`,
              left: `${hex.cx - haloDiameter/2}px`,
              width: `${haloDiameter}px`,
              height: `${haloDiameter}px`,
              borderRadius: "50%",
              border: `solid ${HALO_THICKNESS}px rgba(196,196,255,${this.props.selected ? '0.75' : 0})`
          }}>
        <div className="Token" data-uuid={token.uuid}
            style={{
                position: "absolute",
                top: `${HALO_GAP}px`,
                left: `${HALO_GAP}px`,
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
      </div>
    )
  }
}

export default Token
