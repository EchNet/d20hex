import * as React from "react"
import { connect } from 'react-redux';

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
          { this.renderMenu() }
        </div>
        { this.state.playerNameModalShown && this.renderPlayerNameModal() }
      </header>
    )
  }
  renderMenu() {
    return (
      <div className="Menu">
        <button onMouseEnter={() => this.toggleMenu()} onMouseLeave={() => this.toggleMenu() }>
          {this.props.userName}
        </button>
        { this.state.userMenuShown && (
          <ul onMouseEnter={() => this.toggleMenu()} onMouseLeave={() => this.toggleMenu()}>
            <li data-action="changePlayerName" onClick={(event) => this.handleUserMenuClick(event)}>
              Change player name
            </li>
            <li data-action="logout" onClick={(event) => this.handleUserMenuClick(event)}>
              Log out
            </li>
          </ul>
        )}
      </div>
    )
  }
  toggleMenu() {
    this.setState((oldState) => ({ userMenuShown: !oldState.userMenuShown }))
  }
  handleUserMenuClick(event) {
    event.preventDefault()
    this.toggleMenu(false)
    switch (event.target.getAttribute("data-action")) {
    case "changePlayerName":
      this.openOrClosePlayerNameModal(true);
      break;
    case "logout":
      window.location = "/logout";
      break;
    }
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
