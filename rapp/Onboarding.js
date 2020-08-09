import * as React from "react"
import { connect } from 'react-redux';

import actions from "./actions"
import { MenuButton } from "./Menu"
import Modal from "./Modal"
import SingleTextValueForm from "./SingleTextValueForm"
import HexGridRenderer from "./HexGridRenderer"
import "./Onboarding.css"


export class Onboarding extends React.Component {
  componentDidMount() {
    this.updateCanvas()
  }
  componentDidUpdate() {
    this.updateCanvas()
  }
  updateCanvas() {
    const canvas = this.refs.canvas;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const hgr = new HexGridRenderer(canvas);
    hgr.clear()
    hgr.drawGrid()
  }
  render() {
    return (
      <div className="Onboarding">
        <header>
          <div className="leftSide">
            <img className="logo" src="/static/img/logo.png" height="120" alt="d20hex"/>
          </div>
          <div className="rightSide">
            <MenuButton>{ this.props.userName }</MenuButton>
          </div>
        </header>
        <div className="canvas">
          <canvas ref="canvas"></canvas>
        </div>
        <Modal>
          <div className="titlebar">
            Welcome to <span className="Logo">d20hex</span>!
          </div>
          <div className="body">
            What would you like to be called?<br/>
            <small>
              (This is your name as a player, not the name of your character.  You can
              change it at any time.)
            </small>
          </div>
          <div className="body">
            <SingleTextValueForm placeholder="Enter player name"
                onSubmit={(input) => this.handlePlayerFormSubmit(input)}/>
          </div>
        </Modal>
      </div>
    )
  }
  handlePlayerFormSubmit(input) {
    this.props.dispatch({
      type: actions.CREATE_PLAYER,
      props: { name: input }
    })
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export default connect(mapState)(Onboarding)
