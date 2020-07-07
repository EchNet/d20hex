import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector } from "./connectors"
import SingleTextValueForm from "./SingleTextValueForm"
import actions from "./actions"
import "./AdminView.css"


export class AdminView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ticket: "",
      ticketError: ""
    }
  }
  render() {
    return (
      <div className="AdminView">
        <h3>Admin</h3>
        <SingleTextValueForm placeholder="Enter new campaign name"
            clearOnSubmit="clearOnSubmit"
            onSubmit={(input) => this.handleNewCampaignName(input)}/>
        <button onClick={() => this.generateTicket()}>Generate a ticket</button>
        { this.state.ticket && this.renderTicket() }
        { this.state.ticketError && this.renderTicketError() }
      </div>
    )
  }
  handleNewCampaignName(name) {
    this.props.dispatch({ type: actions.UPDATE_CAMPAIGN, props: { name }})
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
export default connect(mapState)(AdminView)
