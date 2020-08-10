import actions from "../actions"
import config from "../config"

let DEBUG = config("DEBUG");

export class BaseReducerDispatcher {
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

export default BaseReducerDispatcher;
