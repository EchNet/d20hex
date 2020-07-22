import { createStore } from "redux"
import EventEmitter from "eventemitter3"

import { apiConnector, echoConnector } from "./connectors"
import actions from "./actions"
import config from "./config"

let DEBUG = config("DEBUG");

// State properties:
// .campaigns             A hash of campaigns for the current player, indexed by ID string.
// .campaignsKnown        True if .campaigns is completely loaded for the current player.
// .characters            A hash of characters for the current campaign, indexed by ID string.
// .charactersKnown       True if .characters is completely loaded for the current player and
//                        campaign.
// .players               A hash of players for the current user, indexed by ID string.
// .playersKnown          True if .players is completely loaded for the current user.
// .user                  The current user.

function stateReducer(state = 0, action) {
  if (DEBUG) console.log("ACTION", state, action)
  if (!action.type) throw "null action type";
  switch (action.type) {
  case actions.START_APP:
    return startApp(state)
  case actions.USER_KNOWN:
    return userKnown(state, action.data)
  case actions.SELECT_PLAYER:
    return selectPlayer(state, action.player)
  case actions.SELECT_CAMPAIGN:
    return selectCampaign(state, action.campaign)
  case actions.CLOSE_CAMPAIGN:
    return deselectCampaign(state)
  case actions.SHOW_ERROR:
    return showError(state, action.message)
  case actions.SHOW_ALERT:
    return showAlert(state, action.message)
  case actions.LOGIN:
    window.location.href = "/login";
    break;
  case actions.CREATE_PLAYER:
    return createPlayer(state, action.props)
  case actions.PLAYER_CREATED:
    return playerCreated(state, action.data)
  case actions.CREATE_CAMPAIGN:
    return createCampaign(state, action.props)
  case actions.CAMPAIGN_CREATED:
    return campaignCreated(state, action.data)
  case actions.CREATE_CHARACTER:
    return createCharacter(state, action.props)
  case actions.CHARACTER_CREATED:
    return characterCreated(state, action.data)
  case actions.PLAYERS_KNOWN:
    return playersKnown(state, action.data)
  case actions.CAMPAIGNS_KNOWN:
    return campaignsKnown(state, action.data)
  case actions.CHARACTERS_KNOWN:
    return charactersKnown(state, action.data)
  case actions.JOIN_CAMPAIGN:
    return joinCampaign(state, action.props.ticket)
  case actions.WANT_CHARACTERS:
    return wantCharacters(state)
  case actions.UPDATE_PLAYER:
    return updatePlayer(state, action.props)
  case actions.PLAYER_UPDATED:
    return playerUpdated(state, action.data)
  case actions.UPDATE_CAMPAIGN:
    return updateCampaign(state, action.props)
  case actions.CAMPAIGN_UPDATED:
    return campaignUpdated(state, action.data)
  case actions.WANT_MAP:
    return wantMap(state)
  case actions.MAP_KNOWN:
    return mapKnown(state, action.data)
  case actions.SET_BACKGROUND:
    return setBackground(state, action.props)
  }
  if (DEBUG) console.log("warning: action unhandled")
  return state || {};
}

export const mapEventEmitter = new EventEmitter()
export const store = createStore(stateReducer)
store.subscribe(() => DEBUG && console.log("NEW STATE", store.getState()))
store.dispatch({ type: actions.START_APP })

echoConnector.on("app.bg", (props) => {
  store.dispatch({ type: actions.SET_BACKGROUND, props });
})

//=============================================
// STATE TRANSITIONS

function startApp(state) {
  return whoAmI(state);
}

function selectPlayer(state, player) {
  const currentId = state.player ? state.player.id : null;
  const newId = player ? player.id : null;
  if (currentId !== newId) {
    state = updateState(state, {
      player, userName: player.name, campaigns: null, campaignsKnown: false })
    if (player) {
      state = listCampaignsForPlayer(state)
    }
  }
  return state
}

function selectCampaign(state, campaign) {
  const currentId = state.campaign ? state.campaign.id : null;
  const newId = campaign ? campaign.id : null;
  if (currentId !== newId) {
    state = updateState(state, {
      campaign, characters: null, charactersKnown: false, mapKnown: false
    })
    echoConnector.broadcast({
      type: "uc",
      campaignId: campaign.id
    })
  }
  return state;
}

function deselectCampaign(state, campaign) {
  return selectCampaign(state, null)
}

//=============================================
// ENTITY CREATION

function createPlayer(state, props) {
  handleApiCall(apiConnector.createPlayerForUser(state.user, props.name), actions.PLAYER_CREATED)
  return showApiBlock(state)
}

function playerCreated(state, player) {
  state = updatePlayers(state, [ player ])
  state = selectPlayer(state, player)
  return unshowApiBlock(state)
}

function createCampaign(state, props) {
  handleApiCall(apiConnector.createCampaignForPlayer(state.player, props.name),
                actions.CAMPAIGN_CREATED)
  return showApiBlock(state)
}

function campaignCreated(state, campaign) {
  // Synthesize the annotated campaign element.
  campaign = Object.assign(campaign, { creator: state.player, can_manage: true })
  state = updateCampaigns(state, [ campaign ])
  return unshowApiBlock(state)
}

function createCharacter(state, props) {
  handleApiCall(apiConnector.createPlayerCharacter(state.player, state.campaign, props.name),
                actions.CHARACTER_CREATED)
  return showApiBlock(state)
}

function characterCreated(state, character) {
  state = updateCharacters(state, [ character ])
  return unshowApiBlock(state)
}

function showError(state, errorMessage) {
  state = updateState(state, { errorMessage })
  return unshowApiBlock(state)
}

function showAlert(state, alertMessage) {
  state = updateState(state, { alertMessage })
  return unshowApiBlock(state)
}

//=============================================
// STATE-BASED API WRAPPERS

function whoAmI(state) {
  handleApiCall(apiConnector.whoAmI(), actions.USER_KNOWN, actions.LOGIN)
  return showApiBlock(state)
}

function userKnown(state, user) {
  let userName = state.userName;
  if (!userName) {
    userName = user.first_name || user.email || user.username;
  }
  return listPlayersForUser(updateState(state, { user, userName }))
}

function listPlayersForUser(state) {
  handleApiCall(apiConnector.listPlayersForUser(state.user), actions.PLAYERS_KNOWN)
  return showApiBlock(state)
}

function playersKnown(state, players) {
  state = updatePlayers(state, players, true)
  return unshowApiBlock(state)
}

function listCampaignsForPlayer(state) {
  handleApiCall(apiConnector.listCampaignsForPlayer(state.player), actions.CAMPAIGNS_KNOWN)
  return showApiBlock(state)
}

function joinCampaign(state, ticket) {
  handleApiCall(apiConnector.joinCampaign(state.player, ticket),
      actions.CAMPAIGNS_KNOWN, actions.SHOW_ALERT)
  return showApiBlock(state)
}

function campaignsKnown(state, playerCampaigns) {
  playerCampaigns = playerCampaigns || []
  const campaigns = playerCampaigns.map((pc) => 
    Object.assign({}, pc.campaign, { can_manage: pc.can_manage }))
  state = updateCampaigns(state, campaigns, true)
  return unshowApiBlock(state)
}

function wantCharacters(state) {
  if (!state.charactersKnown) {
    let promise;
    if (state.campaign.can_manage) {
      promise = apiConnector.listCharactersForCampaign(state.campaign)
    }
    else {
      promise = apiConnector.listCharactersForPlayerAndCampaign(state.player, state.campaign)
    }
    handleApiCall(promise, actions.CHARACTERS_KNOWN)
    state = showApiBlock(state)
  }
  return wantCampaignTime(state)
}

function charactersKnown(state, characters) {
  state = updateCharacters(state, characters, true)
  return unshowApiBlock(state)
}

function updatePlayer(state, props) {
  handleApiCall(apiConnector.updatePlayer(state.player, props.name), actions.PLAYER_UPDATED)
  return showApiBlock(state)
}

function playerUpdated(state, player) {
  state = updatePlayers(state, [ player ])
  return unshowApiBlock(state)
}

function wantCampaignTime(state) {
  return updateState(state, {
    currentTime: { day: 15, hour: 23, minute: 1, second: 9 },
    currentLocation: { shortName: "Somewhere" },
    currentMelee: { who: "whose turn", whosNext: "===", round: 3 }
  })
}

function updateCampaign(state, props) {
  handleApiCall(apiConnector.updateCampaign(state.campaign, props.name), actions.CAMPAIGN_UPDATED)
  return showApiBlock(state)
}

function campaignUpdated(state, campaign) {
  state = updateCampaigns(state, [ campaign ])
  return unshowApiBlock(state)
}

//=============================================

function wantMap(state) {
  if (!state.mapKnown) {
    handleApiCall(apiConnector.getMapForCampaign(state.campaign), actions.MAP_KNOWN)
  }
  return wantCampaignTime(state)
}

function mapKnown(state, mapData) {
  const map = {
    bg: extractBgMap(mapData)
  }
  return updateState(state, { map, mapKnown: true })
}

function extractBgMap(mapData) {
  let bgHash = {}
  mapData.forEach((ele) => {
    if (ele.layer == "bg") {
      bgHash[ele.position] = ele.value
    }
  })
  return new BgMap(bgHash)
}

function setBackground(state, props) {
  if (!state.map) return;
  if (state.map.bg.setBgValue(props.hex.row, props.hex.col, props.value)) {
    console.log('bg update going out', props.hex)
    mapEventEmitter.emit("bgUpdate", props.hex)
    if (props.author) {
      echoConnector.broadcast({
        type: "bg",
        campaignId: state.campaign.id,
        hex: ((hex) => ({ row: hex.row, col: hex.col }))(props.hex),
        value: props.value
      })
    }
  }
  return state;
}

//=============================================
// HELPERS

class BgMap {
  constructor(data) {
    this.data = data || {};
  }
  getBgValue(row, col) {
    const key = `${row}:${col}`
    return this.data[key]
  }
  setBgValue(row, col, value) {
    const key = `${row}:${col}`
    if (this.data[key] != value) {
      this.data[key] = value;
      return true;
    }
    return false;
  }
}

function updatePlayers(state, datalist, complete = false) {
  state = updateDictionary(state, "players", datalist, complete);
  let player = state.player && state.players[state.player.id.toString()]
  let userName = player ? player.name : state.userName;
  return updateState(state, { player, userName })
}

function updateCampaigns(state, datalist, complete = false) {
  state = updateDictionary(state, "campaigns", datalist, complete);
  let campaign = state.campaign && state.campaigns[state.campaign.id.toString()]
  return updateState(state, { campaign })
}

function updateCharacters(state, datalist, complete = false) {
  return updateDictionary(state, "characters", datalist, complete);
}

function updateDictionary(state, key, datalist, complete) {
  if (!datalist) datalist = []
  let newDict = Object.assign({}, state[key])
  datalist.forEach((ele) => {
    const key = ele.id.toString()
    newDict[key] = Object.assign({}, newDict[key], ele)
  })
  let newState = {}
  newState[key] = newDict;
  if (complete) newState[key + "Known"] = true;
  return updateState(state, newState)
}

function updateState(state, newProps) {
  return Object.assign({}, state, newProps)
}

function showApiBlock(state) {
  return updateState(state, { apiblocked: true })
}

function unshowApiBlock(state) {
  return updateState(state, { apiblocked: false })
}

function handleApiCall(promise, successActionType, errorActionType=actions.SHOW_ERROR) {
  promise
    .then((response) => {
      store.dispatch({ type: successActionType, data: response.data })
    })
    .catch((error) => {
      let message;
      if (error.response) {
        if (DEBUG) console.log(error.response);
        if (error.response.status == 500) {
          message = "Unexpected server error."
        }
        else if (error.response.data) {
          if (error.response.data.detail) {
            message = error.response.data.detail;
          }
        }
      }
      store.dispatch({
        type: errorActionType,
        message: message || error.toString()
      })
    })
}
