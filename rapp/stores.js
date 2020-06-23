import { createStore } from "redux"
import { apiConnector } from "./connectors"
import { actions } from "./constants"

function stateReducer(state = 0, action) {
  switch (action.type) {
  case actions.START:
    return start(state);
  case actions.USER_KNOWN:
    return userKnown(state, action.user);
  case actions.PLAYERS_KNOWN:
    return playersKnown(state, action.players);
  case actions.CREATE_PLAYER:
    return createPlayer(state, action.name);
  case actions.PLAYER_CREATED:
    return playerCreated(state, action.player);
  case actions.FATAL_ERROR:
    return fatalError(state, action.error);
  }
  return state || {};
}

function updateState(state, newProps) {
  return Object.assign({}, state, newProps);
}

function start(state) {
  apiConnector.whoAmI()
    .then((response) => {
      store.dispatch({ type: actions.USER_KNOWN, user: response.data })
    })
    .catch((error) => {
      store.dispatch({ type: actions.FATAL_ERROR, error: error.toString() })
    })
  return updateState(state, { apiblocked: true })
}

function userKnown(state, user) {
  apiConnector.listPlayersForUser(user.id)
    .then((response) => {
      store.dispatch({ type: actions.PLAYERS_KNOWN, players: response.data })
    })
    .catch((error) => {
      store.dispatch({ type: actions.FATAL_ERROR, error: error.toString() })
    })
  return updateState(state, { user: user })
}

function playersKnown(state, players) {
  const player = players && players.length ? players[0] : null;
  return updateState(state, { player: player, players: players, apiblocked: false })
}

function createPlayer(state, name) {
  apiConnector.createPlayerForUser(state.user.id, name)
    .then((response) => {
      store.dispatch({ type: actions.PLAYER_CREATED, player: response.data })
    })
    .catch((error) => {
      store.dispatch({ type: actions.FATAL_ERROR, error: error.toString() })
    })
  return updateState(state, { apiblocked: true })
}

function playerCreated(state, player) {
  return updateState(state, { apiblocked: false, players: [ player ], player: player })
}

function fatalError(state, error) {
  return updateState(state, { error: error, apiblocked: false })
}

export const store = createStore(stateReducer)
store.subscribe(() => console.log(store.getState()))
store.dispatch({ type: actions.START })
