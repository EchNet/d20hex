import * as React from "react"
import Modal from "./Modal"
import "./ErrorScreen.css"


export class ErrorScreen extends React.Component {
  render() {
    return (
      <div className={ this.props.fatal ? "ErrorScreen" : "AlertScreen" }>
        <Modal onClose={ this.props.onClose }>
          <div className="titlebar">{ this.props.fatal ? "Error" : "Oops" }</div>
          <div className="body">{this.props.message}</div>
          <div className="footer">
            { !!this.props.fatal && this.renderFatalButton() }
            { !this.props.fatal && this.renderAlertButton() }
          </div>
        </Modal>
      </div>
    )
  }
  renderFatalButton() {
    return <button type="button" onClick={this.reloadPage}>Click to reload app</button>
  }
  renderAlertButton() {
    return <button type="button" onClick={this.props.onClose}>OK</button>
  }
  reloadPage() {
    document.location.reload()
  }
}

export default ErrorScreen

