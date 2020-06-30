import axios from "axios";
import ImportedCookies from "cookies-js";

class ApiConnector {
  constructor(props) {
    this.props = props || {}
    this.jwt = ImportedCookies.get("jwt")
    this.jwt_tob = Number(ImportedCookies.get("jwt_tob"))
  }
  _doGet(uri) {
    return axios.get(uri, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "X-CSRFToken": ImportedCookies.get("csrftoken")
      }
    })
  }
  _doPost(uri, data) {
    return axios.post(uri, data, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "X-CSRFToken": ImportedCookies.get("csrftoken")
      }
    })
  }
  whoAmI() {
    return this._doGet("/api/1.0/who")
  }
  listPlayersForUser(user) {
    return this._doGet(`/api/1.0/user/${user.id}/players`)
  }
  createPlayerForUser(user, playerName) {
    return this._doPost(`/api/1.0/player`, { "user": user.id, "name": playerName })
  }
  listCampaignsForPlayer(player) {
    return this._doGet(`/api/1.0/player/${player.id}/campaigns`)
  }
  createCampaignForPlayer(player, campaignName) {
    return this._doPost(`/api/1.0/campaign`, { "creator": player.id, "name": campaignName })
  }
  listCharactersForPlayerAndCampaign(player, campaign) {
    return this._doGet(`/api/1.0/player/${player.id}/characters?campaign=${campaign.id}`)
  }
  createPlayerCharacter(player, campaign, characterName) {
    return this._doPost(`/api/1.0/character`, {
        "player": player.id, "campaign": campaign.id, "name": characterName })
  }
  generateTicket(player, campaign) {
    return this._doPost(`/api/1.0/campaign/${campaign.id}/action`, {
        "action": "ticket",
        "granter": player.id
    })
  }
  joinCampaign(player, ticket) {
    return this._doGet(`/api/1.0/player/${player.id}/campaigns?ticket=${ticket}`)
  }
}

export const apiConnector = new ApiConnector()
