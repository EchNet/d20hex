import { createStore } from "redux"
import EventEmitter from "eventemitter3"

import apiConnector from "./connectors/api"
import echoConnector from "./connectors/echo"
import actions from "./actions"
import config from "./config"
import BaseReducerDispatcher from "./reducers/base"
import MapReducerDispatcher from "./reducers/map"
import NavReducerDispatcher from "./reducers/nav"
import NotesReducerDispatcher from "./reducers/notes"
import PlayersReducerDispatcher from "./reducers/players"

let DEBUG = config("DEBUG");

export const mapEventEmitter = new EventEmitter()

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

echoConnector.on("socket.disconnect", () => {
  store.dispatch({ type: actions.SHOW_ERROR, data: "Oops, lost connection to server." });
})
echoConnector.on("app.bg", (props) => {
  if (DEBUG) console.log("app.bg received", props)
  store.dispatch({ type: actions.ECHO_BACKGROUND, props });
})
echoConnector.on("app.token", (props) => {
  if (DEBUG) console.log("app.token received", props)
  store.dispatch({ type: actions.ECHO_TOKEN, props });
})
echoConnector.on("app.note", (props) => {
  if (DEBUG) console.log("app.note received", props)
  store.dispatch({ type: actions.ECHO_NOTE, props });
})

reducerDispatchers = reducerDispatchers.concat([
  new MapReducerDispatcher(store, mapEventEmitter),
  new NavReducerDispatcher(),
  new NotesReducerDispatcher(store),
  new PlayersReducerDispatcher(store),
  new ReducerDispatcherPrime(store)
])
store.dispatch({ type: actions.START_APP })
