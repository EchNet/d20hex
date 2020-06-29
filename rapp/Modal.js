import * as React from "react"
import "./Modal.css"

export class Modal extends React.Component {
  static defaultProps = {
    modal: true
  }
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
    return this.props.modal ? (
      <div className="ModalScreen" onClick={() => this.onClose()}>
        {this.renderWindow()}
      </div>
    ) : this.renderWindow()
  }
  renderWindow() {
    return (
      <div className="ModalContainer">
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
