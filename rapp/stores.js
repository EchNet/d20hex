import { createStore } from "redux"
import EventEmitter from "eventemitter3"
import { v4 as uuidv4 } from "uuid";

import { apiConnector, echoConnector } from "./connectors"
import actions from "./actions"
import config from "./config"

let DEBUG = config("DEBUG");

export const mapEventEmitter = new EventEmitter()

class NavReducerDispatcher {
  login() {
    window.location.href = "/login";
  }
}

class BaseReducerDispatcher {
  constructor(store) {
    this._store = store
  }
  get store() {
    return this._store
  }
  updateState(state, newProps) {
    return Object.assign({}, state, newProps)
  }
  handleApiCall(promise, successActionType, errorActionType=actions.SHOW_ERROR) {
    promise
      .then((response) => {
        this.store.dispatch({ type: successActionType, data: response.data })
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
        this.store.dispatch({
          type: errorActionType,
          message: message || error.toString()
        })
      })
  }
}

class CampaignNotesReducerDispatcher extends BaseReducerDispatcher {
  selectCampaign(state, campaign) {
    if (!campaign) {
      return this.updateState(state, { campaignNotes: null })
    }
    const currentId = state.campaignNotes && state.campaignNotes.campaign.id;
    if (campaign.id !== currentId) {
      this.handleApiCall(apiConnector.getNotesForCampaign(campaign), actions.NOTES_KNOWN)
      return this.updateState(state, { campaignNotes: { campaign, known: false }})
    }
    return state;
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

class ReducerDispatcherPrime extends BaseReducerDispatcher {
  startApp(state) {
    return this.whoAmI(state);
  }
  selectPlayer(state, player) {
    const currentId = state.player ? state.player.id : null;
    const newId = player ? player.id : null;
    if (currentId !== newId) {
      state = this.updateState(state, {
        player, userName: player.name, campaigns: null, campaignsKnown: false })
      if (player) {
        state = this.listCampaignsForPlayer(state)
      }
    }
    return state
  }
  selectCampaign(state, campaign) {
    const currentId = state.campaign ? state.campaign.id : null;
    const newId = campaign ? campaign.id : null;
    if (currentId !== newId) {
      state = this.updateState(state, {
        campaign,
        characters: null,
        charactersKnown: false,
        bgMap: null,
        mapKnown: false,
        tokens: [],
        selectedTool: "grabber",
        counterValue: 1
      })
      echoConnector.broadcast({
        type: "uc",
        campaignId: campaign.id
      })
    }
    return state;
  }
  deselectCampaign(state, campaign) {
    return this.selectCampaign(state, null)
  }
  createPlayer(state, props) {
    this.handleApiCall(apiConnector.createPlayerForUser(state.user, props.name), actions.PLAYER_CREATED)
    return this.showApiBlock(state)
  }
  playerCreated(state, player) {
    state = this.updatePlayers(state, [ player ])
    state = this.selectPlayer(state, player)
    return this.unshowApiBlock(state)
  }
  createCampaign(state, props) {
    this.handleApiCall(apiConnector.createCampaignForPlayer(state.player, props.name),
                  actions.CAMPAIGN_CREATED)
    return this.showApiBlock(state)
  }
  campaignCreated(state, campaign) {
    // Synthesize the annotated campaign element.
    campaign = Object.assign(campaign, { creator: state.player, can_manage: true })
    state = this.updateCampaigns(state, [ campaign ])
    return this.unshowApiBlock(state)
  }
  createCharacter(state, props) {
    this.handleApiCall(apiConnector.createPlayerCharacter(state.player, state.campaign, props.name),
                  actions.CHARACTER_CREATED)
    return this.showApiBlock(state)
  }
  characterCreated(state, character) {
    state = this.updateCharacters(state, [ character ])
    return this.unshowApiBlock(state)
  }
  showError(state, errorMessage) {
    state = this.updateState(state, { errorMessage })
    return this.unshowApiBlock(state)
  }
  showAlert(state, alertMessage) {
    state = this.updateState(state, { alertMessage })
    return this.unshowApiBlock(state)
  }
  whoAmI(state) {
    this.handleApiCall(apiConnector.whoAmI(), actions.USER_KNOWN, actions.LOGIN)
    return this.showApiBlock(state)
  }
  userKnown(state, user) {
    let userName = state.userName;
    if (!userName) {
      userName = user.first_name || user.email || user.username;
    }
    return this.listPlayersForUser(this.updateState(state, { user, userName }))
  }
  listPlayersForUser(state) {
    this.handleApiCall(apiConnector.listPlayersForUser(state.user), actions.PLAYERS_KNOWN)
    return this.showApiBlock(state)
  }
  playersKnown(state, players) {
    state = this.updatePlayers(state, players, true)
    return this.unshowApiBlock(state)
  }
  listCampaignsForPlayer(state) {
    this.handleApiCall(apiConnector.listCampaignsForPlayer(state.player), actions.CAMPAIGNS_KNOWN)
    return this.showApiBlock(state)
  }
  joinCampaign(state, props) {
    this.handleApiCall(apiConnector.joinCampaign(state.player, props.ticket),
        actions.CAMPAIGNS_KNOWN, actions.SHOW_ALERT)
    return this.showApiBlock(state)
  }
  campaignsKnown(state, playerCampaigns) {
    playerCampaigns = playerCampaigns || []
    const campaigns = playerCampaigns.map((pc) => 
      Object.assign({}, pc.campaign, { can_manage: pc.can_manage }))
    state = this.updateCampaigns(state, campaigns, true)
    return this.unshowApiBlock(state)
  }
  wantCharacters(state) {
    if (!state.charactersKnown) {
      let promise;
      if (state.campaign.can_manage) {
        promise = apiConnector.listCharactersForCampaign(state.campaign)
      }
      else {
        promise = apiConnector.listCharactersForPlayerAndCampaign(state.player, state.campaign)
      }
      this.handleApiCall(promise, actions.CHARACTERS_KNOWN)
      state = this.showApiBlock(state)
    }
    // TEMP
    state = this.updateState(state, { currentMelee: { who: "whose turn", whosNext: "===", round: 3 }})
    return state;
  }
  charactersKnown(state, characters) {
    state = this.updateCharacters(state, characters, true)
    return this.unshowApiBlock(state)
  }
  updatePlayer(state, props) {
    this.handleApiCall(apiConnector.updatePlayer(state.player, props.name), actions.PLAYER_UPDATED)
    return this.showApiBlock(state)
  }
  playerUpdated(state, player) {
    state = this.updatePlayers(state, [ player ])
    return this.unshowApiBlock(state)
  }
  updateCampaign(state, props) {
    this.handleApiCall(apiConnector.updateCampaign(state.campaign, props.name), actions.CAMPAIGN_UPDATED)
    return this.showApiBlock(state)
  }
  campaignUpdated(state, campaign) {
    state = this.updateCampaigns(state, [ campaign ])
    return this.unshowApiBlock(state)
  }
  wantMap(state) {
    if (!state.mapKnown) {
      this.handleApiCall(apiConnector.getMapForCampaign(state.campaign), actions.MAP_KNOWN)
    }
    return state
  }
  mapKnown(state, mapData) {
    const bgHash = {}
    const tokens = []
    mapData.forEach((ele) => {
      if (ele.layer == "bg") {
        bgHash[ele.position] = ele.value
      }
      else {
        tokens.push(ele)
      }
    })
    return this.updateState(state, { bgMap: new BgMap(bgHash), tokens, mapKnown: true })
  }
  // Author the setting of a background value.
  setBackground(state, props) {
    if (state.bgMap && state.bgMap.setBgValue(props.hex.row, props.hex.col, props.value)) {
      mapEventEmitter.emit("bgUpdate", props.hex)
      echoConnector.broadcast({
        type: "bg",
        campaignId: state.campaign.id,
        hex: ((hex) => ({ row: hex.row, col: hex.col }))(props.hex),
        value: props.value
      })
    }
    return state;
  }
  // Echo the setting of a background value.
  echoBackground(state, props) {
    if (state.bgMap && state.bgMap.setBgValue(props.hex.row, props.hex.col, props.value)) {
      mapEventEmitter.emit("bgUpdate", props.hex)
    }
    return state;
  }
  // Author the placement of a new token.
  placeToken(state, props) {
    let tokens = state.tokens || [] 
    const uuid = uuidv4()
    const value = props.value;
    const position = `${props.hex.row}:${props.hex.col}`;
    let token = { uuid, position, value }
    tokens = tokens.concat([ token ])
    echoConnector.broadcast({
      type: "token",
      campaignId: state.campaign.id,
      uuid, position, value
    })
    return this.updateState(state, { tokens })
  }
  // Author the placement of a counter.
  modifyToken(state, props) {
    let tokens = (state.tokens || []).slice()
    tokens.forEach((token) => {
      if (token.uuid == props.uuid) {
        token.value = props.value || token.value;
        token.position = props.position || token.position;
        echoConnector.broadcast({
          type: "token",
          campaignId: state.campaign.id,
          uuid: token.uuid,
          position: token.position,
          value: token.value
        })
      }
    })
    return this.updateState(state, { tokens })
  }
  // Author the modification of a counter.
  placeCounter(state, props) {
    const value = `${state.counterValue},${props.fillStyle}`
    state = this.updateState(state, { counterValue: state.counterValue + 1 })
    return this.placeToken(state, Object.assign({}, props, { value }))
  }
  // Echo the placement of a token.
  echoToken(state, props) {
    let found = false;
    let tokens = (state.tokens || []).slice()
    tokens.forEach((token) => {
      if (token.uuid == props.uuid) {
        token.value = props.value;
        token.position = props.position;
        found = true;
      }
    })
    if (!found) {
      const token = { uuid: props.uuid, position: props.position, value: props.value }
      tokens = tokens.concat([ token ])
    }
    return this.updateState(state, { tokens })
  }
  selectTool(state, selectedTool) {
    return this.updateState(state, { selectedTool })
  }
  updatePlayers(state, datalist, complete = false) {
    state = this.updateDictionary(state, "players", datalist, complete);
    let player = state.player && state.players[state.player.id.toString()]
    let userName = player ? player.name : state.userName;
    return this.updateState(state, { player, userName })
  }
  updateCampaigns(state, datalist, complete = false) {
    state = this.updateDictionary(state, "campaigns", datalist, complete);
    let campaign = state.campaign && state.campaigns[state.campaign.id.toString()]
    return this.updateState(state, { campaign })
  }
  updateCharacters(state, datalist, complete = false) {
    return this.updateDictionary(state, "characters", datalist, complete);
  }
  updateDictionary(state, key, datalist, complete) {
    if (!datalist) datalist = []
    let newDict = Object.assign({}, state[key])
    datalist.forEach((ele) => {
      const key = ele.id.toString()
      newDict[key] = Object.assign({}, newDict[key], ele)
    })
    let newState = {}
    newState[key] = newDict;
    if (complete) newState[key + "Known"] = true;
    return this.updateState(state, newState)
  }
  showApiBlock(state) {
    return this.updateState(state, { apiblocked: true })
  }
  unshowApiBlock(state) {
    return this.updateState(state, { apiblocked: false })
  }
}

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

// State properties:
// .campaigns             A hash of campaigns for the current player, indexed by ID string.
// .campaignsKnown        True if .campaigns is completely loaded for the current player.
// .characters            A hash of characters for the current campaign, indexed by ID string.
// .charactersKnown       True if .characters is completely loaded for the current player and
//                        campaign.
// .players               A hash of players for the current user, indexed by ID string.
// .playersKnown          True if .players is completely loaded for the current user.
// .user                  The current user.

let reducerDispatchers = []
export const store = createStore((state = 0, action) => {
  if (DEBUG) console.log("ACTION", state, action)
  state = state || {}
  let reducerCount = 0;
  reducerDispatchers.forEach((reducerDispatcher) => {
    const reducerFunction = reducerDispatcher[action.type]
    if (typeof reducerFunction == "function") {
      const newState = reducerFunction.apply(reducerDispatcher, [
          state,
          action.props || action.data || action.player || action.campaign ||
          action.message || action.tools 
      ])
      if (newState !== undefined) state = newState;
      reducerCount += 1;
    }
  })
  if (DEBUG && reducerCount == 0) console.log("warning: action unhandled")
  return state;
})

store.subscribe(() => DEBUG && console.log("NEW STATE", store.getState()))

echoConnector.on("app.bg", (props) => {
  if (DEBUG) console.log("app.bg received", props)
  store.dispatch({ type: actions.ECHO_BACKGROUND, props });
})
echoConnector.on("app.token", (props) => {
  if (DEBUG) console.log("app.token received", props)
  store.dispatch({ type: actions.ECHO_TOKEN, props });
})

reducerDispatchers = reducerDispatchers.concat([
  new NavReducerDispatcher(),
  new CampaignNotesReducerDispatcher(store),
  new ReducerDispatcherPrime(store)
])
store.dispatch({ type: actions.START_APP })
