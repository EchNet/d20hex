import { createStore } from "redux"
import { apiConnector } from "./connectors"
import actions from "./actions"
import config from "./config"

let DEBUG = config("DEBUG");

// State properties:
// .players ... a hash of players by ID *string*.
// (to be continued)

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
  }
  if (DEBUG) console.log("warning: action unhandled")
  return state || {};
}

export const store = createStore(stateReducer)
store.subscribe(() => DEBUG && console.log("NEW STATE", store.getState()))
store.dispatch({ type: actions.START_APP })

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
    state = updateState(state, { campaign, characters: null })
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
  state = updatePlayerData(state, [ player ])
  state = selectPlayer(state, player)
  return unshowApiBlock(state)
}

function createCampaign(state, props) {
  handleApiCall(apiConnector.createCampaignForPlayer(state.player, props.name),
                actions.CAMPAIGN_CREATED)
  return showApiBlock(state)
}

function campaignCreated(state, campaign) {
  // Synthesize the annotated campaign list.
  campaign = Object.assign(campaign, { creator: state.player, can_manage: true })
  state = updateState(state, {
      campaigns: (state.campaigns || []).concat(campaign),
      campaignsKnown: true })
  return unshowApiBlock(state)
}

function createCharacter(state, props) {
  handleApiCall(apiConnector.createPlayerCharacter(state.player, state.campaign, props.name),
                actions.CHARACTER_CREATED)
  return showApiBlock(state)
}

function characterCreated(state, character) {
  state = updateState(state, { character, characters: (state.characters || []).concat(character) })
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
  players = players || []
  state = updatePlayerData(state, players)
  state = updateState(state, { playersKnown: true })
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
  state = updateState(state, { campaigns, campaignsKnown: true })
  return unshowApiBlock(state)
}

function wantCharacters(state) {
  let promise;
  if (state.campaign.can_manage) {
    promise = apiConnector.listCharactersForCampaign(state.campaign)
  }
  else {
    promise = apiConnector.listCharactersForPlayerAndCampaign(state.player, state.campaign)
  }
  handleApiCall(promise, actions.CHARACTERS_KNOWN)
  return showApiBlock(state)
}

function charactersKnown(state, characters) {
  state = updateState(state, { characters: characters || [] })
  return unshowApiBlock(state)
}

function updatePlayer(state, props) {
  handleApiCall(apiConnector.updatePlayer(state.player, props.name), actions.PLAYER_UPDATED)
  return showApiBlock(state)
}

function playerUpdated(state, player) {
  state = updatePlayerData(state, [ player ])
  return unshowApiBlock(state)
}

//=============================================
// HELPERS

function updatePlayerData(state, newPlayers) {
  let players = (state.players || {})
  newPlayers.forEach((p) => { players[p.id.toString()] = p })
  let player = state.player && players[state.player.id.toString()]
  let userName = state.userName;
  if (player && player.name) {
    userName = player.name;
  }
  return updateState(state, { player, players, userName })
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
