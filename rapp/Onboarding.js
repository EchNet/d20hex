import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import FatHeader from "./FatHeader"
import Modal from "./Modal"
import "./Onboarding.css"


export class Onboarding extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playerNameInput: ""
    }
  }
  render() {
    return (
      <div className="Onboarding">
        <FatHeader/>
        <Modal modal={false}>
          <form onSubmit={(event) => this.handlePlayerFormSubmit(event)}>
            <div className="titlebar">
              Welcome to <span className="Logo">d20hex</span>!
            </div>
            <div className="body">
              What would you like to be called?<br/>
              <small>
                (This is your name as a player, not the name of your character.  You can
                change it at any time.)
              </small>
            </div>
            <div className="body">
              <input onChange={(event) => this.handlePlayerNameChange(event)}
                  placeholder="Enter player name"/>
            </div>
            <div className="footer">
              <input type="submit" disabled={this.state.playerNameInput.length ? "" : "disabled"}/>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
  handlePlayerNameChange(event) {
    this.setState({ playerNameInput: event.target.value })
  }
  handlePlayerFormSubmit(event) {
    event.preventDefault()
    if (this.state.playerNameInput.length) {
      this.props.dispatch({
        type: actions.CREATE_PLAYER,
        props: { name: this.state.playerNameInput }
      })
    }
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export default connect(mapState)(Onboarding)
