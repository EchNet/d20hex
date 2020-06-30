import { createStore } from "redux"
import { apiConnector } from "./connectors"
import { actions } from "./constants"
import config from "./config"

let DEBUG = config("DEBUG");

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
    return showError(state, action.error, action.isFatal)
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
  case actions.PLAYER_CAMPAIGNS_KNOWN:
    return playerCampaignsKnown(state, action.data)
  case actions.PLAYER_CHARACTERS_KNOWN:
    return playerCharactersKnown(state, action.data)
  case actions.JOIN_CAMPAIGN:
    return joinCampaign(state, action.props.ticket)
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
  const playerChanging = currentId !== newId;
  state = updateState(state, { player, userName: player.name })
  if (playerChanging) {
    state = deselectCampaign(state);
    state = updateState(state, { campaigns: null })
    if (player) {
      state = listCampaignsForPlayer(state)
    }
  }
  return state
}

function selectCampaign(state, campaign) {
  const currentId = state.campaign ? state.campaign.id : null;
  const newId = campaign ? campaign.id : null;
  const campaignChanging = currentId !== newId;
  state = updateState(state, { campaign })
  if (campaignChanging) {
    state = updateState(state, { characters: null })
    if (campaign) {
      state = listCharactersForPlayerAndCampaign(state)
    }
  }
  return state
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
  const players = (state.players || []).concat([ player ])
  state = updateState(state, { players })
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
  state = updateState(state, { campaigns: (state.campaigns || []).concat(campaign) })
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

function showError(state, error, isFatal) {
  state = updateState(state, { error })
  return unshowApiBlock(state)
}

//=============================================
// STATE-BASED API WRAPPERS

function whoAmI(state) {
  handleApiCall(apiConnector.whoAmI(), actions.USER_KNOWN)
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
  state = updateState(state, { players })
  if (players.length) {
    // Auto-select the first player.
    state = selectPlayer(state, players[0])
  }
  return unshowApiBlock(state)
}

function joinCampaign(state, ticket) {
  handleApiCall(apiConnector.joinCampaign(state.player, ticket),
      actions.PLAYER_CAMPAIGNS_KNOWN, false)
  return showApiBlock(state)
}

function listCampaignsForPlayer(state) {
  handleApiCall(apiConnector.listCampaignsForPlayer(state.player), actions.PLAYER_CAMPAIGNS_KNOWN)
  return showApiBlock(state)
}

function playerCampaignsKnown(state, playerCampaigns) {
  playerCampaigns = playerCampaigns || []
  const campaigns = playerCampaigns.map((pc) => 
    Object.assign({}, pc.campaign, { can_manage: pc.can_manage }))
  state = updateState(state, { campaigns })
  return unshowApiBlock(state)
}

function listCharactersForPlayerAndCampaign(state) {
  handleApiCall(apiConnector.listCharactersForPlayerAndCampaign(state.player, state.campaign),
                actions.PLAYER_CHARACTERS_KNOWN)
  return showApiBlock(state)
}

function playerCharactersKnown(state, characters) {
  state = updateState(state, { characters: characters || [] })
  return unshowApiBlock(state)
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

function handleApiCall(promise, successActionType, isFatal) {
  if (isFatal === undefined) isFatal = true;
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
      store.dispatch({ type: actions.ERROR, error: errorString, isFatal })
    })
}
