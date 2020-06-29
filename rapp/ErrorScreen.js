import * as React from "react"
import Modal from "./Modal"
import "./ErrorScreen.css"


export class ErrorScreen extends React.Component {
  render() {
    return (
      <div className="ErrorScreen">
        <Modal>
          <div className="titlebar">Error</div>
          <div className="body">{this.props.error}</div>
          <div className="footer">
            <button type="button" onClick={this.reloadPage}>Click to reload app</button>
          </div>
        </Modal>
      </div>
    )
  }
  reloadPage() {
    document.location.reload()
  }
}

export default ErrorScreen

