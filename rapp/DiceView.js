import * as React from "react"
import { connect } from "react-redux"

import "./DiceView.css"

export class DiceView extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="DiceView">
        <iframe src={`${window.location.protocol}//d20srd.org/extras/d20dicebag/`}></iframe>
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(DiceView)
