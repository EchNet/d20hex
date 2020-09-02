import * as React from "react"
import { connect } from "react-redux";

import "./PaletteGroup.css"
import actions from "./actions"

export class PaletteGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      choices: props.choices.slice(),
      forceClose: false
    }
  }
  render() {
    const isSelected = !!this.state.choices.find((ele) => ele == this.props.paletteValue)
    const jsx = (
      <div className={`PaletteGroup${isSelected ? " selected" : ""}`}>
        <div className="slideOut">
          { !this.state.forceClose && this.state.choices.map((ele) => this.renderCell(ele)) }
          { !!this.state.forceClose && this.renderCell(this.state.choices[0]) }
        </div>
      </div>
    )
    return jsx;
  }
  renderCell(value) {
    const valueParts = value.split("|")
    const classes = ["cell"].concat(this.extraCellClasses(valueParts))
    const styles = this.parseStyles(valueParts)
    const label = this.parseLabel(valueParts)
    return (
      <div key={value} className={classes.join(" ")} style={styles}
          onClick={(event) => this.handleCellClick(value)}>{label}</div>
    )
  }
  extraCellClasses(valueParts) {
    return valueParts.length > 1 && valueParts[1] == "" ? ["white"] : []
  }
  parseLabel(valueParts) {
    if (valueParts[0] === "function") {
      return String.fromCharCode(0x27f3);
    }
    if (this.props.labels) {
      return this.props.labels[valueParts[1]] || "1";
    }
    return "";
  }
  parseStyles(valueParts) {
    const styles = {}
    if (valueParts[0] === "function") {
      styles.color = "black";
    }
    else if (valueParts.length > 1) {
      if (valueParts[1].startsWith("url(")) {
        styles.background = valueParts[1];
        styles.backgroundSize = "cover";
      }
      else {
        styles.backgroundColor = valueParts[1] }
    }
    return styles;
  }
  handleCellClick(value) {
    if (value === "function|reset") {
      const valueParts = this.state.choices[0].split("|")
      this.props.dispatch({ type: actions.RESET_COUNTER_VALUE, props: { fillStyle: valueParts[1] }})
    }
    else {
      this.props.onSelect && this.props.onSelect(value)
      this.setState({ choices: this.rearrangeChoices(value), forceClose: true })
      setTimeout(() => { this.setState({ forceClose: false }) }, 200)
    }
  }
  rearrangeChoices(value) {
    let newChoices = this.state.choices.filter((ele) => ele != value)
    newChoices.unshift(value);
    return newChoices;
  }
}
const mapState = (state) => {
  return Object.assign({ isGM: state.campaign.can_manage }, state);
}
export default connect(mapState)(PaletteGroup)
