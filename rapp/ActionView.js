import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import "./ActionView.css"


function tfmt(n) {
  if (n < 0 || n > 99) return "??"
  n = Math.floor(n)
  return (n < 10 ? "0" : "") + n
}

export class ActionView extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    const t = this.props.currentTime;
    return (
      <div className="ActionView">
        <div className="toolbar">
          <div>
            { t && <span>Day {t.day}</span> }
          </div>
          <div>
            { t && <span>{tfmt(t.hour)}:{tfmt(t.minute)}:{tfmt(t.second)}</span> }
          </div>
        </div>
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(ActionView)
