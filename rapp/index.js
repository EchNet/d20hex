import * as React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import App from "./app";
import { store } from "./stores";
import "./app.css";

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById("root")
)

if (module.hot) {
  module.hot.accept()
}
