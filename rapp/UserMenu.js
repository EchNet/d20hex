import * as React from "react"
import { connect } from "react-redux"

import { Menu, MenuItem } from "./Menu"
import Modal from "./Modal"
import SingleTextValueForm from "./SingleTextValueForm"
import actions from "./actions"


export class UserMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playerNameModalShown: false
    }
  }
  render() {
    return (
      <div>
        <Menu right="right" label={this.props.userName}>
          <MenuItem onClick={() => this.openOrClosePlayerNameModal(true)}>
            Change player name
          </MenuItem>
          <MenuItem onClick={() => window.location = "/logout"}>
            Log out
          </MenuItem>
        </Menu>
        { this.state.playerNameModalShown && this.renderPlayerNameModal() }
      </div>
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

export default connect(mapState)(UserMenu)
