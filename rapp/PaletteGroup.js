import * as React from "react"

import "./PaletteGroup.css"

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
    const label = this.props.label || ""; 
    return (
      <div key={value} className={classes.join(" ")} style={styles}
          onClick={(event) => this.handleCellClick(value)}>{label}</div>
    )
  }
  extraCellClasses(valueParts) {
    return valueParts.length > 1 && valueParts[1] == "" ? ["white"] : []
  }
  parseStyles(valueParts) {
    const styles = {}
    if (valueParts.length > 1) {
      if (valueParts[1].startsWith("url(")) {
        styles.background = valueParts[1];
        styles.backgroundSize = "cover";
      }
      else {
        styles.backgroundColor = valueParts[1]
      }
    }
    return styles;
  }
  handleCellClick(value) {
    this.props.onSelect && this.props.onSelect(value)
    this.setState({ choices: this.rearrangeChoices(value), forceClose: true })
    setTimeout(() => { this.setState({ forceClose: false }) }, 200)
  }
  rearrangeChoices(value) {
    let newChoices = this.state.choices.filter((ele) => ele != value)
    newChoices.unshift(value);
    return newChoices;
  }
}

export default PaletteGroup;

