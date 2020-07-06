import * as React from "react"
import { connect } from "react-redux"

import actions from "./actions"
import SingleTextValueForm from "./SingleTextValueForm"
import "./CharactersView.css"


export class CharactersView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characterNameInput: "",
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="CharactersView">
        <h3>My characters</h3>
        { (!this.props.characters || !this.props.characters.length) && <div>No characters yet.</div> }
        { !!this.props.characters && !!this.props.characters.length && this.renderCharacterList() }
        <SingleTextValueForm placeholder="New character name"
            onSubmit={(input) => this.handleCharacterFormSubmit(input)}/>
      </div>
    )
  }
  renderCharacterList() {
    return this.props.characters.map((ele) => <div key={ele.id}>{ele.name}</div>)
  }
  handleCharacterFormSubmit(input) {
    this.props.dispatch({
      type: actions.CREATE_CHARACTER,
      props: { name: this.state.characterNameInput }
    })
  }
}
const mapState = (state) => {
  const flattenedCharacters = Object.keys(state.characters).map((ele) => state.characters[ele])
  return Object.assign({}, state, { characters: flattenedCharacters })
}
export default connect(mapState)(CharactersView)

