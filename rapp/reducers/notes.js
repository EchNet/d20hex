import actions from "../actions"
import apiConnector from "../connectors/api"
import BaseReducerDispatcher from "./base";

export class NotesReducerDispatcher extends BaseReducerDispatcher {
  selectCampaign(state, campaign) {
    if (!campaign) {
      return this.updateState(state, { campaignNotes: null })
    }
    const currentId = state.campaignNotes && state.campaignNotes.campaign.id;
    this.requestNotes(campaign)
    if (campaign.id !== currentId) {
      return this.updateState(state, { campaignNotes: { campaign, known: false }})
    }
  }
  wantNotes(state) {
    this.requestNotes(state.campaign)
  }
  requestNotes(campaign) {
    this.handleApiCall(apiConnector.getNotesForCampaign(campaign), actions.NOTES_KNOWN)
  }
  notesKnown(state, data) {
    const notes = {}
    data.forEach((noteData) => {
      notes[noteData.topic] = noteData;
    })
    return this.updateState(state, {
      campaignNotes: { campaign: state.campaign, known: true, notes }
    })
  }
}

export default NotesReducerDispatcher;
