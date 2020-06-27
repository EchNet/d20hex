import * as React from "react"
import { connect } from 'react-redux';
import { actions } from "./constants"
import "./CampaignPicker.css"

class CampaignPickerComponent extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="CampaignPicker">
        <h2>My Campaigns</h2>
        <div className="campaignListBox">
          { (!this.props.campaigns || !this.props.campaigns.length) && <p>None yet.</p> }
          { !!this.props.campaigns && !!this.props.campaigns.length && this.renderCampaignList() }
        </div>
        <h2 className="push-top">Join a Campaign</h2>
        <p>
          To join a campaign, ask the campaign creator for a ticket code and enter it here:<br/>
          <input type="text"/><input type="submit"/>
        </p>
        <h2 className="push-top">Start a Campaign</h2>
        <p><a href="#" onClick={() => this.openCreateCampaignModal()}>Click here</a> to start a 
        new campaign.</p>
      </div>
    )
  }
  renderCampaignList() {
    return this.props.campaigns.map((campaign) => this.renderCampaign(campaign))
  }
  renderCampaign(campaign) {
    return (
      <div key={campaign.id} data-id={campaign.id} className="campaignView"
          onClick={(event) => this.handleCampaignViewClick(event)}>
        <div className="campaignIconView"></div>
        <div className="campaignNameView">{campaign.name}</div>
        <div className="campaignCreatorView">Created by <span className="value">{campaign.creator.name}</span></div>
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
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export const CampaignPicker = connect(mapState)(CampaignPickerComponent)
export default CampaignPicker
