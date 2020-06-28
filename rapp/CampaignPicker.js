import * as React from "react"
import { connect } from 'react-redux';
import { actions } from "./constants"
import { Modal } from "./Modal"
import config from "./config"
import "./CampaignPicker.css"

class CampaignPickerComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      maxCampaignsPerPlayer: config("maxCampaignsPerPlayer"),
      campaignModalVisible: false,
      campaignNameInput: ""
    }
  }
  renderCampaignList() {
    return this.props.campaigns.map((campaign) => this.renderCampaign(campaign))
  }
  renderCampaign(campaign) {
    return (
      <div key={campaign.id} data-id={campaign.id} className="campaignView"
          onClick={(event) => this.handleCampaignViewClick(event)}>
        <div className="campaignIconView"></div>
        <div className="campaignGoView">Go!</div>
        <div className="campaignNameView">{campaign.name}</div>
        <div className="campaignCreatorView">
          Created by <span className="value">{campaign.creator.name}</span>
        </div>
      </div>
    )
  }
  atLeastNCampaigns(min) {
    return !!this.props.campaigns && this.props.campaigns.length >= min;
  }
  render() {
    return (
      <div className="CampaignPicker">
        <h2>My Campaigns</h2>
        <div className="campaignListBox">
          { !this.atLeastNCampaigns(1) && <p>None yet.</p> }
          { this.atLeastNCampaigns(1) && this.renderCampaignList() }
        </div>
        <h2 className="push-top">Join a Campaign</h2>
        <p>
          To join a campaign, ask the campaign creator for a ticket code and enter it here:<br/>
          <input type="text"/><input type="submit"/>
        </p>
        <h2 className="push-top">Start a Campaign</h2>
        <p>
          { this.atLeastNCampaigns(this.state.maxCampaignsPerPlayer) &&
            <span className="nix">Click here to start a new campaign.</span>}
          { !this.atLeastNCampaigns(this.state.maxCampaignsPerPlayer) &&
            <span>
              <a href="#" onClick={() => this.openOrCloseNewCampaignModal(true)}>Click here</a> to
              start a new campaign. 
            </span> }
          <span> Limit of {this.state.maxCampaignsPerPlayer} campaigns per player.</span>
        </p>
        { this.state.campaignModalVisible && this.renderCampaignModal() }
      </div>
    )
  }
  handleCampaignViewClick(event) {
    const props = this.props;
    const id = event.currentTarget.getAttribute("data-id");
    props.campaigns.forEach((campaign) => {
      console.log(campaign)
      if (campaign.id == id) {
        props.dispatch({ type: actions.SELECT_CAMPAIGN, campaign })
      }
    })
  }
  openOrCloseNewCampaignModal(open) {
    this.setState({ campaignModalVisible: !!open, campaignNameValue: "" })
  }
  renderCampaignModal() {
    return (
      <Modal onClose={() => this.openOrCloseNewCampaignModal(false)}>
        <form onSubmit={() => this.handleNewCampaignFormSubmit()}>
          <div className="titlebar">Start a Campaign</div>
          <div className="body">
            <input type="text" value={this.state.campaignNameValue}
                onChange={(event) => this.handleCampaignNameValueChange(event)}
                placeholder="Enter name of campaign"/>
          </div>
          <div className="footer">
            <input type="submit" disabled={this.newCampaignFormIsValid() ? "" : "disabled"}/>
          </div>
        </form>
      </Modal>
    )
  }
  handleCampaignNameValueChange(event) {
    this.setState({ campaignNameValue: event.target.value })
  }
  handleNewCampaignFormSubmit() {
    this.props.dispatch({
      type: actions.CREATE_CAMPAIGN,
      props: { name: this.state.campaignNameValue }
    })
    this.openOrCloseNewCampaignModal(false)
  }
  newCampaignFormIsValid() {
    return this.state.campaignNameValue.length > 0;
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export const CampaignPicker = connect(mapState)(CampaignPickerComponent)
export default CampaignPicker
