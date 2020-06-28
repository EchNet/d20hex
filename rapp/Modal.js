import * as React from "react"
import "./Modal.css"

export class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.onKeyDown = (event) => {
      if (event.keyCode == 27/*esc*/) {
        this.onClose();
      }
    }
  }
  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown)
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown)
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
