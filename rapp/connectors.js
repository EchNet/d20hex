import axios from "axios"
import ImportedCookies from "cookies-js"
import { w3cwebsocket as WebSocket } from "websocket"
import EventEmitter from "eventemitter3"
import config from "./config"

let DEBUG = config("DEBUG");

function toQueryString(params) {
  return Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  ).join("&")
}

class ApiConnector {
  constructor(props) {
    this.props = props || {}
    this.jwt = ImportedCookies.get("jwt")
    this.jwt_tob = Number(ImportedCookies.get("jwt_tob"))
  }
  _doGet(uri, data={}) {
    const salt = Math.random().toString(16).substring(2)
    const queryString = toQueryString(Object.assign({ _: salt }, data))
    return axios.get(`${uri}?${queryString}`, {
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
  _doPut(uri, data) {
    return axios.put(uri, data, {
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
    return this._doGet(`/api/1.0/player/${player.id}/characters`, { campaign: campaign.id })
  }
  listCharactersForCampaign(campaign) {
    return this._doGet(`/api/1.0/campaign/${campaign.id}/characters`)
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
    return this._doGet(`/api/1.0/player/${player.id}/campaigns`, { ticket })
  }
  updatePlayer(player, playerName) {
    const data = Object.assign({}, player, { name: playerName })
    return this._doPut(`/api/1.0/player/${player.id}`, data)
  }
  updateCampaign(campaign, campaignName) {
    const data = Object.assign({}, campaign, { name: campaignName })
    return this._doPut(`/api/1.0/campaign/${campaign.id}`, data)
  }
  getMapForCampaign(campaign) {
    return this._doGet(`/api/1.0/campaign/${campaign.id}/map`)
  }
}

class EchoConnector extends EventEmitter {
  static getEndpoint() {
    const scheme = window.location.protocol == "https:" ? "wss" : "ws";
    return scheme + "://" + window.location.host + "/ws/map/";
  }
  open() {
    // TODO: authorization
    if (this.client && this.client.readyState == WebSocket.OPEN) {
      return Promise.resolve(this.client)
    }
    if (!this.openPromise) {
      this.openPromise = new Promise((resolve, reject) => {
        const endpoint = EchoConnector.getEndpoint()
        this.client = new WebSocket(endpoint)
        this.client.onopen = () => {
          this.openPromise = null;
          this.emit("socket.connect")
          resolve(this.client)
        }
        this.client.onclose = () => {
          this.emit("socket.disconnect")
        }
        this.client.onmessage = (event) => {
          if (DEBUG) console.log(event)
          const data = JSON.parse(event.data)
          this.emit(`app.${data.type}`, data)
        }
      })
    }
    return this.openPromise;
  }
  broadcast(event) {
    this.open().then((client) => {
      client.send(JSON.stringify(event))
    })
  }
}

export const apiConnector = new ApiConnector()
export const echoConnector = new EchoConnector()
