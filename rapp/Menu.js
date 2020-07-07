import * as React from "react"

import "./Menu.css"


export class Menu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dropdownShown: false
    }
  }
  render() {
    return (
      <div className={"Menu" + (this.props.right ? " right" : "")}>
        <button onMouseEnter={() => this.toggleDropdown()}
            onMouseLeave={() => this.toggleDropdown() }>
          { !this.props.right && <i className="material-icons">menu</i> }
          <span>{this.props.label}</span>
          { !!this.props.right && <i className="material-icons">menu</i> }
        </button>
        { this.state.dropdownShown && (
          <ul onMouseEnter={() => this.toggleDropdown()}
              onMouseLeave={() => this.toggleDropdown()}
              onClick={() => this.toggleDropdown()}>
            {this.props.children}
          </ul>
        )}
      </div>
    )
  }
  toggleDropdown() {
    this.setState((oldState) => ({ dropdownShown: !oldState.dropdownShown }))
  }
}

export class MenuItem extends React.Component {
  render() {
    return (
      <li className="MenuItem" onClick={(event) => this.handleClick(event)}>
        {this.props.children}
      </li>
    )
  }
  handleClick(event) {
    this.props.onClick && this.props.onClick(event)
  }
}

export default Menu
