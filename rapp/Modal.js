import * as React from "react"
import "./Modal.css"

export class Modal extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="ModalScreen" onClick={() => this.onClose()}>
        <div className="ModalWindow" onClick={(event) => event.stopPropagation()}>
          {this.props.children}
        </div>
      </div>
    )
  }
  onClose() {
    this.props.onClose && this.props.onClose()
  }
}

export default Modal
