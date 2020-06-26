import { createStore } from "redux"
import { apiConnector } from "./connectors"
import { actions } from "./constants"

let DEBUG = true;

function stateReducer(state = 0, action) {
  if (DEBUG) console.log(state, action)
  switch (action.type) {
  // User actions:
  case actions.START_APP:
    return startApp(state)
  case actions.CREATE_PLAYER:
    return createPlayer(state, action.props)
  case actions.CREATE_CAMPAIGN:
    return createCampaign(state, action.props)
  case actions.SELECT_CAMPAIGN:
    return selectCampaign(state, action.campaign)
  // API response actions:
  case actions.USER_KNOWN:
    return userKnown(state, action.data)
  case actions.PLAYERS_KNOWN:
    return playersKnown(state, action.data)
  case actions.CAMPAIGNS_KNOWN:
    return campaignsKnown(state, action.data)
  case actions.PLAYER_CREATED:
    return playerCreated(state, action.data)
  case actions.CAMPAIGN_CREATED:
    return campaignCreated(state, action.data)
  case actions.FATAL_ERROR:
    return fatalError(state, action.error)
  }
  return state || {};
}

export const store = createStore(stateReducer)
store.subscribe(() => DEBUG && console.log(store.getState()))
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

function selectCampaign(state, campaign) {
  return updateState(state, { campaign })
}

//=============================================
// API RESPONSE HANDLERS

function userKnown(state, user) {
  return listPlayersForUser(updateState(state, { user: user }))
}

function playersKnown(state, players) {
  players = players || [];
  const player = players.length ? players[0] : null;
  state = updateState(state, { player, players, campaigns: null })
  if (player) {
    return listCampaignsForPlayer(state)
  }
  else {
    return unshowApiBlock(state)
  }
}

function playerCreated(state, player) {
  return unshowApiBlock(updateState(state, { players: [ player ], player }))
}

function campaignsKnown(state, campaigns) {
  return unshowApiBlock(updateState(state, { campaigns: campaigns || [] }))
}

function campaignCreated(state, campaign) {
  return listCampaignsForPlayer(updateState(state, { campaign }))
}

function fatalError(state, error) {
  return updateState(state, { error: error, apiblocked: false })
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
      store.dispatch({ type: actions.FATAL_ERROR, error: error.toString() })
    })
}
