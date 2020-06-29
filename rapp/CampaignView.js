import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector } from "./connectors"
import { actions } from "./constants"

export class CampaignView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characterNameInput: "",
    }
  }
  render() {
    return (
      <div className="CampaignView">
        <div><a href="#" onClick={() => this.backToLobby()}>Back to lobby</a></div>
        <h2>My Characters</h2>
        { (!this.props.characters || !this.props.characters.length) && <div>No characters yet.</div> }
        { !!this.props.characters && !!this.props.characters.length && renderCharacterList() }
        <div>
          <form onSubmit={(event) => this.handleCharacterFormSubmit(event)}>
            <input onChange={(event) => this.handleCharacterNameChange()} value={this.state.characterNameInput} placeholder="New character name"/>
            <button type="submit" disabled={this.state.characterNameInput.length ? "" : "disabled"}>
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
  renderCharacterList() {
    return (
      <div>
        <div>Your characters</div>
        { this.props.characters.map((ele) => <div key={ele.id}>{ele.name}</div>) }
      </div>
    )
  }
  handleCharacterNameChange(event) {
    this.setState({ characterNameInput: event.target.value })
  }
  handleCharacterFormSubmit(event) {
    event.preventDefault()
    if (this.state.characterNameInput.length) {
      this.props.dispatch({
        type: actions.CREATE_CHARACTER,
        props: { name: this.state.characterNameInput }
      })
    }
    this.setState({ characterNameInput: "" })
  }
  backToLobby() {
    this.props.dispatch({ type: actions.CLOSE_CAMPAIGN })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(CampaignView)

