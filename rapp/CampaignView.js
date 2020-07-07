import * as React from "react"
import { connect } from 'react-redux';

import { apiConnector } from "./connectors"
import actions from "./actions"
import AdminView from "./AdminView"
import CharactersView from "./CharactersView"
import ActionView from "./ActionView"
import {Menu, MenuItem} from "./Menu"
import UserMenu from "./UserMenu"
import "./CampaignView.css"


export class CampaignView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      actionViewShown: true,
      charactersViewShown: false,
      adminViewShown: false
    }
  }
  componentDidMount() {
    this.props.dispatch({ type: actions.WANT_CHARACTERS })
  }
  render() {
    return (
      <div className="CampaignView">
        { this.renderHeader() }
        { this.state.actionViewShown && <ActionView/> }
        { this.state.adminViewShown && <AdminView/> }
        { this.state.charactersViewShown && <CharactersView/> }
      </div>
    )
  }
  renderHeader() {
    return (
      <header>
        <div className="left">
          <Menu icon="menu" label={this.props.campaign.name }>
            <MenuItem onClick={() => this.showActionView()}>
              The Action
            </MenuItem>
            <MenuItem onClick={() => this.showCharactersView()}>
              Characters
            </MenuItem>
            { this.props.campaign.can_manage && 
              <MenuItem onClick={() => this.showAdminView()}>
                Admin
              </MenuItem> }
            <MenuItem onClick={() => this.backToLobby()}>
              Exit Campaign
            </MenuItem>
          </Menu>
        </div>
        <div><img src="/static/img/favicon-32x32.png"/></div>
        <UserMenu/>
      </header>
    )
  }
  showActionView() {
    this.setState({ actionViewShown: true, charactersViewShown: false, adminViewShown: false })
  }
  showCharactersView() {
    this.setState({ actionViewShown: false, charactersViewShown: true, adminViewShown: false })
  }
  showAdminView() {
    this.setState({ actionViewShown: false, charactersViewShown: false, adminViewShown: true })
  }
  backToLobby() {
    this.props.dispatch({ type: actions.CLOSE_CAMPAIGN })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(CampaignView)
