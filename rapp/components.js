import * as React from "react"

import { apiConnector } from "./connectors"
import { actions } from "./constants"

export class WaitScreen extends React.Component {
  render() {
    return <div className="Waiting">Waiting</div>
  }
}

export class Onboarding extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playerNameInput: ""
    }
  }

  render() {
    const handlePlayerNameChange = (event) => {
      this.setState({ playerNameInput: event.target.value })
    }

    const handlePlayerFormSubmit = (event) => {
      event.preventDefault()
      if (this.state.playerNameInput.length) {
        this.props.dispatch({ type: actions.CREATE_PLAYER, name: this.state.playerNameInput })
      }
    }

    return (
      <div className="Onboarding">
        <div className="section1">
          Welcome to <span className="Logo">d20hex</span>!
        </div>
        <div className="section2">
          What would you like to be called as a player?
        </div>
        <div className="section3">
          (This is your player name, not the name of your character.  You can
          change it at any time.)
        </div>
        <div className="section4">
          <form onSubmit={handlePlayerFormSubmit}>
            <input onChange={handlePlayerNameChange} placeholder="Enter player name"/>
            <button type="submit" disabled={this.state.playerNameInput.length ? "" : "disabled"}>
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export class PlayerLobby extends React.Component {
  render() {
    return (
      <div className="PlayerLobby">Lobby of player {this.props.player.name}</div>
    )
  }
}

export class ErrorScreen extends React.Component {
  render() {
    return <div className="ErrorPopup">{this.props.error}</div>
  }
}
