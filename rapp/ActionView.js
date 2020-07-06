import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import "./ActionView.css"


export class ActionView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="ActionView">
        ACTION HERE.
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(ActionView)
