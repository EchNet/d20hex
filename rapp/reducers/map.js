import { v4 as uuidv4 } from "uuid";

import actions from "../actions"
import apiConnector from "../connectors/api"
import echoConnector from "../connectors/echo"
import BaseReducerDispatcher from "./base";

export class MapReducerDispatcher extends BaseReducerDispatcher {
  constructor(state, mapEventEmitter) {
    super(state)
    this.mapEventEmitter = mapEventEmitter;
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
      this.mapEventEmitter.emit("bgUpdate", props.hex)
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
      this.mapEventEmitter.emit("bgUpdate", props.hex)
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
      if (value) {
        this.data[key] = value;
      }
      else {
        delete this.data[key];
      }
      return true;
    }
    return false;
  }
}

export default MapReducerDispatcher;