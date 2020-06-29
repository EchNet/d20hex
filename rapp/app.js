import * as React from "react"
import { connect } from 'react-redux';

import Onboarding from "./Onboarding";
import CampaignPicker from "./CampaignPicker";
import WaitScreen from "./WaitScreen";
import ErrorScreen from "./ErrorScreen";
import { PlayerLobby } from "./components";


export class App extends React.Component {
  render() {
    return (
      <div className="RootContainer">
        { !this.props.player && this.props.user && <Onboarding dispatch={this.props.dispatch}/> }
        { this.props.player && !this.props.campaign && <CampaignPicker/> }
        { this.props.player && this.props.campaign && <PlayerLobby/> }
        { this.props.apiblocked && <WaitScreen/> }
        { this.props.error && <ErrorScreen error={this.props.error}/> }
      </div>
    )
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

export default connect(mapState)(App)
