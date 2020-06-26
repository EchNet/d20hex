import axios from "axios"
import ImportedCookies from "cookies-js"
import { w3cwebsocket as WebSocket } from "websocket"
import EventEmitter from "eventemitter3"

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
}

class EchoConnector extends EventEmitter {
  static getEndpoint() {
    const scheme = window.location.protocol == "https:" ? "wss" : "ws";
    return scheme + "://" + window.location.host + "/ws/echo/";
  }
  open() {
    if (this.client && this.client.readyState == WebSocket.OPEN) {
      return Promise.resolve(this.client)
    }
    if (!this.openPromise) {
      this.openPromise = new Promise((resolve, reject) => {
        const endpoint = EchoConnector.getEndpoint()
        this.client = new WebSocket(endpoint)
        this.client.onopen = () => {
          this.openPromise = null;
          this.emit("connect")
          resolve(this.client)
        }
        this.client.onclose = () => {
          this.emit("disconnect")
        }
        this.client.onmessage = (event) => {
          const data = JSON.parse(event.data)
          this.emit("message", data.message)
        }
      })
    }
    return this.openPromise;
  }
  send(message) {
    this.open().then((client) => {
      client.send(JSON.stringify({ type: "message", message }))
    })
  }
}

export const apiConnector = new ApiConnector()
export const echoConnector = new EchoConnector()
