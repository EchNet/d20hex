import * as React from "react"
import { connect } from 'react-redux';

export class RosterView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <div className="RosterView">
      </div>
    )
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(RosterView)
