import * as React from "react"
import { connect } from 'react-redux'
import { Link } from "react-router-dom"

import actions from "./actions"
import Modal from "./Modal"
import SingleTextValueForm from "./SingleTextValueForm"
import UserMenu from "./UserMenu"
import config from "./config"
import "./PlayerLobby.css"

class PlayerLobby extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      maxCampaignsPerPlayer: config("maxCampaignsPerPlayer", 3),
      campaignModalVisible: false
    }
  }
  renderCampaignList() {
    return this.props.campaigns.map((campaign) => this.renderCampaign(campaign))
  }
  renderCampaign(campaign) {
    return (
      <Link key={campaign.id} to={`/player/${this.props.player.id}/campaign/${campaign.id}`}>
        <div className="campaignView">
          <div className="campaignIconView"></div>
          <div className="campaignGoView">Go!</div>
          <div className="campaignNameView">{campaign.name}</div>
          <div className="campaignCreatorView">
            Created by <span className="value">{campaign.creator.name}</span>
            <span> </span>
            { campaign.can_manage && <span className="tag">manager</span> }
          </div>
        </div>
      </Link>
    )
  }
  atLeastNCampaigns(min) {
    return !!this.props.campaigns && this.props.campaigns.length >= min;
  }
  render() {
    return (
      <div className="PlayerLobby">
        <header>
          <div className="leftSide">
            <img className="logo" src="/static/img/logo.png" height="120" alt="d20hex"/>
          </div>
          <div className="rightSide">
            <UserMenu/>
          </div>
        </header>
        <div className="body">
          <h2>My Campaigns</h2>
          <div className="campaignListBox">
            { !this.atLeastNCampaigns(1) && <p>None yet.</p> }
            { this.atLeastNCampaigns(1) && this.renderCampaignList() }
          </div>
          <h2 className="push-top">Join a Campaign</h2>
          <div>To join a campaign, ask the campaign creator for a ticket code and enter it here:</div>
          <SingleTextValueForm placeholder="Enter ticket here"
                onSubmit={(value) => this.handleTicketSubmit(value)}/>
          <h2 className="push-top">Start a Campaign</h2>
          <p>
            { this.atLeastNCampaigns(this.state.maxCampaignsPerPlayer) &&
              <span className="nix">Click here to start a new campaign.</span>}
            { !this.atLeastNCampaigns(this.state.maxCampaignsPerPlayer) &&
              <span>
                <a href="#" onClick={(event) => this.handleNewCampaignClick(event)}>Click here</a> to
                start a new campaign. 
              </span> }
            <span> Limit of {this.state.maxCampaignsPerPlayer} campaigns per player.</span>
          </p>
          { this.state.campaignModalVisible && this.renderCampaignModal() }
        </div>
      </div>
    )
  }
  handleNewCampaignClick(event) {
    event.preventDefault()
    this.openOrCloseNewCampaignModal(true)
  }
  openOrCloseNewCampaignModal(open) {
    this.setState({ campaignModalVisible: !!open })
  }
  renderCampaignModal() {
    return (
      <Modal onClose={() => this.openOrCloseNewCampaignModal(false)}>
        <div className="titlebar">Start a Campaign</div>
        <div className="body">
          <SingleTextValueForm placeholder="Enter name of campaign" maxLength={40}
          onSubmit={(name) => this.handleNewCampaignFormSubmit(name)}/>
        </div>
      </Modal>
    )
  }
  handleNewCampaignFormSubmit(name) {
    this.props.dispatch({
      type: actions.CREATE_CAMPAIGN,
      props: { name }
    })
    this.openOrCloseNewCampaignModal(false)
  }
  handleTicketSubmit(ticket) {
    this.props.dispatch({
      type: actions.JOIN_CAMPAIGN,
      props: { ticket }
    })
  }
}

const mapState = (state) => {
  const flattenedCampaigns = Object.keys(state.campaigns).map((ele) => state.campaigns[ele])
  return Object.assign({}, state, { campaigns: flattenedCampaigns })
}

export default connect(mapState)(PlayerLobby)
