import actions from "../actions"
import apiConnector from "../connectors/api"
import echoConnector from "../connectors/echo"
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
  createNote(state, data) {
    echoConnector.broadcast(Object.assign({
      type: "note",
      campaignId: state.campaignNotes.campaign.id,
    }, data))
    return this.echoNote(state, data)
  }
  echoNote(state, data) {
    const campaignNotes = Object.assign({}, state.campaignNotes)
    campaignNotes.notes[data.topic] = data;
    return this.updateState(state, { campaignNotes })
  }
}

export default NotesReducerDispatcher;
