import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector } from "./connectors"
import actions from "./actions"
import "./CampaignView.css"


export class CampaignView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characterNameInput: "",
      ticket: "",
      ticketError: ""
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="CampaignView">
        { this.renderTopNav() }
        { this.renderCharactersView() }
        { this.props.campaign.can_manage && this.renderTicketGenerator() }
      </div>
    )
  }
  renderTopNav() {
    return (
      <div className="topNav">
        <div className="left">
          <i className="material-icons" onClick={() => this.backToLobby()}>exit_to_app</i>
        </div>
        <div className="middle">{ this.props.campaign.name }</div>
        <div className="right">
          <span>{ this.props.userName }</span> &nbsp;
          <i className="material-icons">face</i>
        </div>
      </div>
    )
  }
  backToLobby() {
    this.props.dispatch({ type: actions.CLOSE_CAMPAIGN })
  }
  renderCharactersView() {
    return (
      <div>
        <h3>My characters</h3>
        { (!this.props.characters || !this.props.characters.length) && <div>No characters yet.</div> }
        { !!this.props.characters && !!this.props.characters.length && this.renderCharacterList() }
        { this.renderNewCharacterForm() }
      </div>
    )
  }
  renderCharacterList() {
    return this.props.characters.map((ele) => <div key={ele.id}>{ele.name}</div>)
  }
  renderNewCharacterForm() {
    return (
      <div>
        <form onSubmit={(event) => this.handleCharacterFormSubmit(event)}>
          <input onChange={(event) => this.handleCharacterNameChange(event)} value={this.state.characterNameInput} placeholder="New character name"/>
          <button type="submit" disabled={this.state.characterNameInput.length ? "" : "disabled"}>
            Submit
          </button>
        </form>
      </div>
    )
  }
  handleCharacterNameChange(event) {
    this.setState({ characterNameInput: event.target.value })
  }
  handleCharacterFormSubmit(event) {
    event.preventDefault()
    if (this.state.characterNameInput.length) {
      this.props.dispatch({
        type: actions.CREATE_CHARACTER,
        props: { name: this.state.characterNameInput }
      })
    }
    this.setState({ characterNameInput: "" })
  }
  renderTicketGenerator() {
    return (
      <div>
        <h3>Admin</h3>
        <button onClick={() => this.generateTicket()}>Generate a ticket</button>
        { this.state.ticket && this.renderTicket() }
        { this.state.ticketError && this.renderTicketError() }
      </div>
    )
  }
  renderTicket() {
    return (
      <div>
        <div>{this.state.ticket}</div>
        <div>
          Give this to your players and tell them to enter it through the form
          under "Join a Campaign." Ticket expires 3 days from issue.
        </div>
      </div>
    )
  }
  renderTicketError() {
    return (
      <div style={{ color: "red" }}>{this.state.ticketError}</div>
    )
  }
  generateTicket() {
    this.setState({ ticket: "", ticketError: "" })
    apiConnector.generateTicket(this.props.player, this.props.campaign)
      .then((response) => {
        this.setState({ ticket: response.data.ticket, ticketError: "" })
      })
      .catch((error) => {
        this.setState({ ticket: "", ticketError: "failed. oops." })
      })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(CampaignView)
