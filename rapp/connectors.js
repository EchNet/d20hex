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
  listPlayersForUser(userId) {
    return this._doGet(`/api/1.0/user/${userId}/players`)
  }
  createPlayerForUser(userId, name) {
    return this._doPost(`/api/1.0/player`, { "user": userId, "name": name })
  }
}

export const apiConnector = new ApiConnector()
