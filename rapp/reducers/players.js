import actions from "../actions"
import apiConnector from "../connectors/api"
import BaseReducerDispatcher from "./base";

export class PlayersReducerDispatcher extends BaseReducerDispatcher {
  wantCampaignPlayers(state) {
    if (state.campaign && state.campaign.players == null) {
      this.requestPlayers(state.campaign)
    }
  }
  requestPlayers(campaign) {
    this.handleApiCall(apiConnector.getPlayersForCampaign(campaign), actions.CAMPAIGN_PLAYERS_KNOWN)
  }
  campaignPlayersKnown(state, data) {
    return this.updateState(state, {
      campaign: Object.assign({}, state.campaign, { players: data })
    })
  }
}

export default PlayersReducerDispatcher;
