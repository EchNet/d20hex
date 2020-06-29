import * as React from "react"
import { connect } from 'react-redux';

import "./FatHeader.css"


export class FatHeader extends React.Component {
  render() {
    return (
      <header className="FatHeader">
        <div className="rightSide">
          <img className="logo" src="/static/img/logo.png" height="120" alt="d20hex"/>
        </div>
        <div className="rightSide">
          <span>{this.props.userName}</span><span> </span>
          <a href="/logout"><button type="button">Log out</button></a>
        </div>
      </header>
    )
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export default connect(mapState)(FatHeader)
