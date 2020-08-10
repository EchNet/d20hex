import * as React from "react"
import { connect } from 'react-redux';

import apiConnector from "./connectors/api"
import "./TicketTool.css"


export class TicketTool extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.generateTicket();
  }
  render() {
    return (
      <div className="TicketTool">
        <h3>User Ticketing</h3>
        <div className="ticketContainer">
          <input type="text" readOnly="readOnly" className="ticketValue" ref="ticketValue" value={this.state.ticket}/>
          <a href=" " title="Copy to clipboard" onClick={(e) => this.handleCopy(e)}>
            <i className="material-icons">content_copy</i>
          </a>
        </div>
        <div className="messageContainer">
          { !!this.state.ticketError && <span className="error">{ this.state.ticketError }</span> }
          { !this.state.ticketError && <span className="instructions">{ this.instructions }</span> }
        </div>
        <div className="buttonContainer">
          <input type="submit" onClick={() => this.generateTicket()} value="Generate a new ticket"/>
          <button onClick={() => this.props.onClose && this.props.onClose()}>Close</button>
        </div>
      </div>
    )
  }
  handleCopy(e) {
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
  return Object.assign({}, state);
}
export default connect(mapState)(TicketTool)
