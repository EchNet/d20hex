import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import apiConnector from "./connectors/api"
import "./PlayerRoster.css"


export class PlayerRoster extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CAMPAIGN_PLAYERS })
    this.generateTicket()
  }
  render() {
    return (
      <div className="PlayerRoster">
        <div className="closeButtonContainer">
          <button onClick={() => this.props.onClose && this.props.onClose()}>X</button>
        </div>
        <h3>Players</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>ID</th><th>Is GM?</th></tr>
          </thead>
          <tbody>
            { this.props.campaignPlayers.map((ele) => this.renderPlayerRow(ele)) }
          </tbody>
        </table>
        <hr/>
        <h3>Invite More Players</h3>
        <div className="ticketContainer">
          <input type="text" readOnly="readOnly" className="ticketValue" ref="ticketValue" value={this.state.ticket}/>
          <a href=" " title="Copy to clipboard" onClick={(e) => this.handleCopyTicket(e)}>
            <i className="material-icons">content_copy</i>
          </a>
        </div>
        <div className="messageContainer">
          { !!this.state.ticketError && <span className="error">{ this.state.ticketError }</span> }
          { !this.state.ticketError && <span className="instructions">{ this.instructions }</span> }
        </div>
        <div className="buttonContainer">
          <input type="submit" onClick={() => this.generateTicket()} value="Generate a new ticket"/>
        </div>
      </div>
    )
  }
  renderPlayerRow(player) {
    return (
      <tr key={player.id}>
        <td>{ player.name }</td>
        <td>{ player.id }</td>
        <td><input type="checkbox" defaultChecked={player.can_manage ? "checked" : ""}/></td>
      </tr>
    )
  }
  handleCopyTicket(e) {
    event.preventDefault();
    this.refs.ticketValue.select()
    this.refs.ticketValue.setSelectionRange(0, 9999);
    document.execCommand("copy");
  }
  get instructions() {
    return (
      "Copy this string and send it to the players you wish to allow into your campaign. " +
      "They may enter it under \"Join a Campaign.\" " +
      "Tickets expire 3 days from issue."
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
  const campaignPlayers = (state.campaign && state.campaign.players) || [];
  return Object.assign({ campaignPlayers }, state);
}
export default connect(mapState)(PlayerRoster)
