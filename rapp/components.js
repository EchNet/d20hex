import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector, echoConnector } from "./connectors"
import { actions } from "./constants"

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
