import * as React from "react"
import { connect } from "react-redux"

import { Menu, MenuItem } from "./Menu"
import Modal from "./Modal"
import SingleTextValueForm from "./SingleTextValueForm"
import actions from "./actions"
import "./FatHeader.css"


export class FatHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userMenuShown: false,
      playerNameModalShown: false
    }
  }
  render() {
    return (
      <header className="FatHeader">
        <div className="leftSide">
          <img className="logo" src="/static/img/logo.png" height="120" alt="d20hex"/>
        </div>
        <div className="rightSide">
          <Menu right="right" label={this.props.userName}>
            <MenuItem onClick={() => this.openOrClosePlayerNameModal(true)}>
              Change player name
            </MenuItem>
            <MenuItem onClick={() => window.location = "/logout"}>
              Log out
            </MenuItem>
          </Menu>
        </div>
        { this.state.playerNameModalShown && this.renderPlayerNameModal() }
      </header>
    )
  }
  openOrClosePlayerNameModal(playerNameModalShown) {
    this.setState({ playerNameModalShown });
  }
  renderPlayerNameModal() {
    return (
      <Modal onClose={() => this.openOrClosePlayerNameModal(false)}>
        <div className="titlebar">Change Player Name</div>
        <div className="body">
          <SingleTextValueForm placeholder="Enter new player name" maxLength={40}
          onSubmit={(name) => this.handlePlayerNameFormSubmit(name)}/>
        </div>
      </Modal>
    )
  }
  handlePlayerNameFormSubmit(name) {
    this.props.dispatch({
      type: actions.UPDATE_PLAYER,
      props: { name }
    })
    this.openOrClosePlayerNameModal(false)
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export default connect(mapState)(FatHeader)
