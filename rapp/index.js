import * as React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import App from "./App";
import { store } from "./stores";

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById("root")
)

if (module.hot) {
  module.hot.accept()
}
