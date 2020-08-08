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
      <div className={this.myClassName}
          onMouseEnter={() => this.toggleDropdown()}
          onMouseLeave={() => this.toggleDropdown()}
          onClick={() => this.toggleDropdown()}>
        { this.props.children[0] }
        { this.state.dropdownShown && this.props.children.slice(1) }
      </div>
    )
  }
  get myClassName() {
    return "Menu" + (this.props.orientation === "right" ? " right" : "")
  }
  toggleDropdown() {
    this.setState((oldState) => ({ dropdownShown: !oldState.dropdownShown }))
  }
}

export const DefaultMenu = (props) => {
  return (
    <Menu orientation={props.orientation}>
      <MenuButton>
        <i className="material-icons">menu</i> <span>{props.label}</span>
      </MenuButton>
      <ul>
        {props.children}
      </ul>
    </Menu>
  )
}

export const MenuButton = (props) => {
  return (
    <button className="MenuButton">
      {props.children}
      <i className="material-icons">menu</i> <span>{props.label}</span>
    </button>
  )
}

export const MenuItem = (props) => {
  console.log('render menu item', props)
  return (
    <li className="MenuItem" onClick={(event) => props.onClick && props.onClick(event)}>
      {props.children}
    </li>
  )
}

export default Menu
