import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector } from "./connectors"
import { actions } from "./constants"

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
        this.props.dispatch({
          type: actions.CREATE_PLAYER,
          props: { name: this.state.playerNameInput }
        })
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

class PlayerLobbyComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      campaignNameInput: "",
      currentCampaignOption: null
    }
  }
  render() {
    const props = this.props;
    const state = this.state;

    const handleCampaignNameChange = (event) => {
      this.setState({ campaignNameInput: event.target.value })
    }

    const handleCampaignFormSubmit = (event) => {
      event.preventDefault()
      if (state.campaignNameInput.length) {
        this.props.dispatch({
          type: actions.CREATE_CAMPAIGN,
          props: { name: state.campaignNameInput }
        })
      }
    }

    const handleCurrentCampaignOptionChange = (event) => {
      const campaignId = event.target.value;
      for (var i = 0; i < props.campaigns.length; ++i) {
        console.log(props.campaigns[i]);
        if (props.campaigns[i].id == campaignId) {
          this.setState({ currentCampaignOption: props.campaigns[i] })
          return;
        }
      }
      this.setState({ currentCampaignOption: null })
    }

    return (
      <div className="PlayerLobby">
        { !!props.campaign && <CampaignView/> }
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export const PlayerLobby = connect(mapState)(PlayerLobbyComponent)

class CampaignViewComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characterNameInput: "",
    }
  }
  render() {
    const props = this.props;
    const state = this.state;

    const handleCharacterNameChange = (event) => {
      this.setState({ characterNameInput: event.target.value })
    }

    const handleCharacterFormSubmit = (event) => {
      event.preventDefault()
      if (state.characterNameInput.length) {
        this.props.dispatch({
          type: actions.CREATE_CHARACTER,
          props: { name: state.characterNameInput }
        })
      }
      this.setState({ characterNameInput: "" })
    }

    const renderCharacterList = () => {
      return (
        <div>
          <div>Your characters</div>
          { this.props.characters.map((ele) => <div key={ele.id}>{ele.name}</div>) }
        </div>
      )
    }

    return (
      <div className="CampaignView">
        <div><a href="#" onClick={() => this.backToLobby()}>Back to lobby</a></div>
        <h2>My Characters</h2>
        { (!this.props.characters || !this.props.characters.length) && <div>No characters yet.</div> }
        { !!this.props.characters && !!this.props.characters.length && renderCharacterList() }
        <div>
          <form onSubmit={handleCharacterFormSubmit}>
            <input onChange={handleCharacterNameChange} value={state.characterNameInput} placeholder="New character name"/>
            <button type="submit" disabled={state.characterNameInput.length ? "" : "disabled"}>
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
  backToLobby() {
    this.props.dispatch({ type: actions.CLOSE_CAMPAIGN })
  }
}
export const CampaignView = connect(mapState)(CampaignViewComponent)
