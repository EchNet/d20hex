import { createStore } from "redux"
import { apiConnector } from "./connectors"
import { actions } from "./constants"
import config from "./config"

let DEBUG = config("DEBUG");

function stateReducer(state = 0, action) {
  if (DEBUG) console.log("ACTION", state, action)
  if (!action.type) throw "null action type";
  switch (action.type) {
  // User actions:
  case actions.START_APP:
    return startApp(state)
  case actions.CREATE_PLAYER:
    return createPlayer(state, action.props)
  case actions.CREATE_CAMPAIGN:
    return createCampaign(state, action.props)
  case actions.CREATE_CHARACTER:
    return createCharacter(state, action.props)
  case actions.SELECT_CAMPAIGN:
    return selectCampaign(state, action.campaign)
  case actions.CLOSE_CAMPAIGN:
    return closeCampaign(state)
  // API response actions:
  case actions.USER_KNOWN:
    return userKnown(state, action.data)
  case actions.PLAYERS_KNOWN:
    return playersKnown(state, action.data)
  case actions.CAMPAIGNS_KNOWN:
    return campaignsKnown(state, action.data)
  case actions.CHARACTERS_KNOWN:
    return charactersKnown(state, action.data)
  case actions.PLAYER_CREATED:
    return playerCreated(state, action.data)
  case actions.CAMPAIGN_CREATED:
    return campaignCreated(state, action.data)
  case actions.CHARACTER_CREATED:
    return characterCreated(state, action.data)
  case actions.FATAL_ERROR:
    return fatalError(state, action.error)
  }
  if (DEBUG) console.log("warning: action unhandled")
  return state || {};
}

export const store = createStore(stateReducer)
store.subscribe(() => DEBUG && console.log("NEW STATE", store.getState()))
store.dispatch({ type: actions.START_APP })

//=============================================
// USER ACTION HANDLERS

function startApp(state) {
  handleApiCall(apiConnector.whoAmI(), actions.USER_KNOWN)
  return showApiBlock(state)
}

function createPlayer(state, props) {
  handleApiCall(apiConnector.createPlayerForUser(state.user, props.name), actions.PLAYER_CREATED)
  return showApiBlock(state)
}

function createCampaign(state, props) {
  handleApiCall(apiConnector.createCampaignForPlayer(state.player, props.name),
                actions.CAMPAIGN_CREATED)
  return showApiBlock(state)
}

function createCharacter(state, props) {
  handleApiCall(apiConnector.createPlayerCharacter(state.player, state.campaign, props.name),
                actions.CHARACTER_CREATED)
  return showApiBlock(state)
}

function selectCampaign(state, campaign) {
  if (!state.campaign || state.campaign.id != campaign.id) {
    handleApiCall(apiConnector.listCharactersForPlayerAndCampaign(state.player, campaign),
                  actions.CHARACTERS_KNOWN)
    state = updateState(state, { campaign, characters: null })
  }
  return state
}

function closeCampaign(state) {
  return updateState(state, { campaign: null, characters: null })
}

//=============================================
// API RESPONSE HANDLERS

function userKnown(state, user) {
  let userName = state.userName;
  if (!userName) {
    userName = user.first_name || user.email || user.username;
  }
  return listPlayersForUser(updateState(state, { user, userName }))
}

function playersKnown(state, players) {
  players = players || [];
  const player = players.length ? players[0] : null;
  state = updateState(state, { player, players, campaigns: null })
  state = unshowApiBlock(state)
  if (player) {
    state = updateState(state, { userName: player.name })
    state = listCampaignsForPlayer(state)
  }
  return state;
}

function campaignsKnown(state, campaigns) {
  state = updateState(state, { campaigns: campaigns || [] })
  return unshowApiBlock(state)
}

function charactersKnown(state, characters) {
  state = updateState(state, { characters: characters || [] })
  return unshowApiBlock(state)
}

function playerCreated(state, player) {
  state = updateState(state, { players: [ player ], player, userName: player.name })
  return unshowApiBlock(state)
}

function campaignCreated(state, campaign) {
  // Expand the creator.
  campaign = Object.assign(campaign, { creator: state.player})
  state = updateState(state, { campaigns: (state.campaigns || []).concat(campaign) })
  return unshowApiBlock(state)
}

function characterCreated(state, character) {
  state = updateState(state, { character, characters: (state.characters || []).concat(character) })
  return unshowApiBlock(state)
}

function fatalError(state, error) {
  state = updateState(state, { error: error })
  return unshowApiBlock(state)
}

//=============================================
// CHAINED API CALLS

function listPlayersForUser(state) {
  handleApiCall(apiConnector.listPlayersForUser(state.user), actions.PLAYERS_KNOWN)
  return showApiBlock(state)
}

function listCampaignsForPlayer(state) {
  handleApiCall(apiConnector.listCampaignsForPlayer(state.player), actions.CAMPAIGNS_KNOWN)
  return showApiBlock(state)
}

//=============================================
// HELPERS

function updateState(state, newProps) {
  return Object.assign({}, state, newProps)
}

function showApiBlock(state) {
  return updateState(state, { apiblocked: true })
}

function unshowApiBlock(state) {
  return updateState(state, { apiblocked: false })
}

function handleApiCall(promise, successActionType) {
  promise
    .then((response) => {
      store.dispatch({ type: successActionType, data: response.data })
    })
    .catch((error) => {
      if (DEBUG) console.log(error);
      let errorString = error.toString()
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorString = error.response.data.detail;
        }
      }
      store.dispatch({ type: actions.FATAL_ERROR, error: errorString })
    })
}
