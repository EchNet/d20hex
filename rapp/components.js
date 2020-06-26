import * as React from "react"
import { connect } from 'react-redux';

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
        if (props.campaigns[i].id == campaignId) {
          this.setState({ currentCampaignOption: props.campaigns[i] })
          return;
        }
      }
      this.setState({ currentCampaignOption: null })
    }

    const handleSelectCampaignFormSubmit = (event) => {
      event.preventDefault()
      if (state.currentCampaignOption) {
        props.dispatch({
          type: actions.SELECT_CAMPAIGN,
          campaign: state.currentCampaignOption
        })
      }
    }

    function renderCampaignSelect() {
      return (
        <form onSubmit={handleSelectCampaignFormSubmit}>
          <div>
            Select a campaign
            <select onChange={handleCurrentCampaignOptionChange}>
              { props.campaigns.map((ele) => <option key={ele.id} value={ele.id}>{ele.name}</option>) }
            </select>
            <button type="submit">
              Go
            </button>
          </div>
        </form>
      )
    }

    return (
      <div className="PlayerLobby">
        <div>Player: {this.props.player.name}</div>
        { (!this.props.campaigns || !this.props.campaigns.length) && <div>No campaigns yet.</div> }
        { !!this.props.campaigns && !!this.props.campaigns.length && renderCampaignSelect() }
        <div>
          <form onSubmit={handleCampaignFormSubmit}>
            <input onChange={handleCampaignNameChange} placeholder="New campaign name"/>
            <button type="submit" disabled={state.campaignNameInput.length ? "" : "disabled"}>
              Submit
            </button>
          </form>
        </div>
        { !!props.campaign && <div>This is the {props.campaign.name} campaign.</div> }
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export const PlayerLobby = connect(mapState)(PlayerLobbyComponent)

export class ErrorScreen extends React.Component {
  render() {
    return <div className="ErrorPopup">{this.props.error}</div>
  }
}
