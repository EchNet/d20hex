import * as React from "react"
import { connect } from 'react-redux'
import { HashRouter as Router, Switch, Redirect, Route} from "react-router-dom"

import Onboarding from "./Onboarding"
import CampaignPicker from "./CampaignPicker"
import CampaignView from "./CampaignView"
import WaitScreen from "./WaitScreen"
import ErrorScreen from "./ErrorScreen"
import actions from "./actions"


export class App extends React.Component {
  render() {
    return (
      <div className="RootContainer">
        <MainView/>
        { this.props.apiblocked && <WaitScreen/> }
        { this.props.errorMessage && <ErrorScreen message={this.props.errorMessage} fatal={true}/> }
        { this.props.alertMessage &&
            <ErrorScreen message={this.props.alertMessage} onClose={() => this.closeAlert()}/> }
      </div>
    )
  }
  closeAlert() {
    this.props.dispatch({ type: actions.SHOW_ALERT, message: "" })
  }
}

export class MainView extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/player/:playerId" component={ConnectedPlayerPathView}/>
          <Route path="*" component={ConnectedDefaultPathView}/>
        </Switch>
      </Router>
    )
  }
}

class DefaultPathView extends React.Component {
  // What to show if there is no player in the path.
  render() {
    // If there are Players available, select and show the first one.
    if (this.props.players && this.props.players.length) {
      const player = this.props.players[0];
      return <Redirect to={`/player/${player.id}`}/>
    }
    // Otherwise, let the user create one.
    return <Onboarding/>
  }
}

class PlayerPathView extends React.Component {
  // What to show if there is a player in the path.
  constructor(props) {
    super(props)
    this.state = { ready: false }
  }
  componentDidMount() {
    this.selectPlayer()
  }
  componentDidUpdate() {
    this.selectPlayer()
  }
  selectPlayer() {
    if (this.props.playersKnown) {
      if (!this.props.player || this.props.player.id !== this.matchedPlayerId) {
        const player = this.findPlayer()
        if (player) {
          this.props.dispatch({ type: actions.SELECT_PLAYER, player })
        }
      }
      if (!this.state.ready) {
        this.setState({ ready: true })
      }
    }
  }
  findPlayer() {
    const matchedPlayerId = this.matchedPlayerId;
    return this.props.players.find((ele) => ele.id === matchedPlayerId)
  }
  get matchedPlayerId() {
    return parseInt(this.props.match.params.playerId)
  }
  get propsConsistentWithPath() {
    return this.props.player && this.props.player.id === this.matchedPlayerId
  }
  render() {
    if (this.state.ready) {
      if (!this.propsConsistentWithPath) {
        return <Redirect to="/"/>  // Expected player not found.
      }
      // The identified player was selected.  Continue resolving the view.
      if (this.props.campaignsKnown) {
        return (
          <Switch>
            <Route path="/player/:playerId/campaign/:campaignId"
                component={ConnectedCampaignPathView}/>
            <Route path="*" component={CampaignPicker}/>
          </Switch>
        )
      }
    }
    return null;
  }
}

class CampaignPathView extends React.Component {
  // What to show if there is a player and a campaign in the path.
  constructor(props) {
    super(props)
    this.state = { ready: false }
  }
  componentDidMount() {
    this.selectCampaign()
  }
  componentDidUpdate() {
    this.selectCampaign()
  }
  selectCampaign() {
    if (this.props.campaignsKnown) {
      if (!this.props.campaign || this.props.campaign.id !== this.matchingCampaignId) {
        const campaign = this.findCampaign()
        if (campaign) {
          this.props.dispatch({ type: actions.SELECT_CAMPAIGN, campaign })
        }
      }
      if (!this.state.ready) {
        this.setState({ ready: true })
      }
    }
  }
  findCampaign() {
    const matchedCampaignId = this.matchedCampaignId;
    return this.props.campaigns.find((ele) => ele.id === matchedCampaignId)
  }
  get matchedCampaignId() {
    return parseInt(this.props.match.params.campaignId)
  }
  get propsConsistentWithPath() {
    return this.props.campaign && this.props.campaign.id === this.matchedCampaignId
  }
  render() {
    if (this.state.ready) {
      if (!this.propsConsistentWithPath) {
        return <Redirect to="/"/>  // Expected campaign not found.
      }
      return <CampaignView/>
    }
    return null;
  }
}

const mapState = (state) => {
  return Object.assign({}, state);
}

const ConnectedPlayerPathView = connect(mapState)(PlayerPathView)
const ConnectedCampaignPathView = connect(mapState)(CampaignPathView)
const ConnectedDefaultPathView = connect(mapState)(DefaultPathView)
export default connect(mapState)(App)
