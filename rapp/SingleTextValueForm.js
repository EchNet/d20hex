import * as React from "react"
import "./SingleTextValueForm.css"


class SingleTextValueForm extends React.Component {
  static defaultProps = {
    maxLength: 120,
    placeholder: "Enter value"
  }
  constructor(props) {
    super(props)
    this.state = {
      inputValue: ""
    }
  }
  render() {
    return (
      <div className="SingleTextValueForm">
        <form onSubmit={(event) => this.handleFormSubmit(event)}>
          <div className="rowrowrow">
            <div className="textInputBox">
              <input type="text" maxLength={this.props.maxLength} value={this.state.inputValue}
                  onChange={(event) => this.handleInputValueChange(event)}
                  placeholder={this.props.placeholder}/>
            </div>
            <div className="submitBox">
              <input type="submit" disabled={this.inputIsValid() ? "" : "disabled"}/>
            </div>
          </div>
        </form>
      </div>
    )
  }
  handleInputValueChange(event) {
    this.setState({ inputValue: event.target.value })
  }
  handleFormSubmit(event) {
    event.preventDefault()
    this.props.onSubmit && this.props.onSubmit(this.state.inputValue) 
  }
  inputIsValid() {
    if (!this.state.inputValue.length) return false;
    return true;
  }
}

export default SingleTextValueForm

