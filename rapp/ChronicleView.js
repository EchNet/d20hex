import * as React from "react"
import { connect } from "react-redux";

import actions from "./actions"
import TimeLabel from "./TimeLabel"
import "./ChronicleView.css"

export class ChronicleView extends React.Component {
  constructor(props) {
    super(props)
  }
  get currentTime() {
    try {
      return Object.assign({}, this.props.campaignNotes.notes.time.json)
    }
    catch (e) {
      return { day: 0, hour: 0, minute: 0, second: 0 };
    }
  }
  get currentLocation() {
    try {
      return this.props.campaignNotes.notes.location.text;
    }
    catch (e) {
      return ""
    }
  }
  get latestEvent() {
    try {
      return this.props.campaignNotes.notes.time.text;
    }
    catch (e) {
      return "";
    }
  }
  render() {
    return (
      <div className="ChronicleView">
        <h3>Set time and location</h3>
        <form onSubmit={(event) => this.handleFormSubmit(event, 1)}>
          <div className="dayInputContainer">
            <div className="label">Day:</div>
            <input ref="dayInput" defaultValue={ this.currentTime.day }/>
          </div>
          <div className="timeInputContainer">
            <div className="label">Time:</div>
            <input ref="hourInput" defaultValue={ this.currentTime.hour }/> : <span> </span>
            <input ref="minuteInput" defaultValue={ this.currentTime.minute }/> : <span> </span>
            <input ref="secondInput" defaultValue={ this.currentTime.second }/>
          </div>
          <div className="locationInputContainer">
            <div className="label">Location:</div>
            <input ref="locationInput" defaultValue={ this.currentLocation }/>
          </div>
          <div>
            <div className="label"></div> <input type="submit"/>
          </div>
        </form>
        <br/><br/>
        <h3>Record an event</h3>
        <form onSubmit={(event) => this.handleFormSubmit(event, 2)}>
          <div>
            <div className="label">Previous:</div> <span>{ this.latestEvent }</span>
          </div>
          <div>
            <div className="label">Starting at:</div> <TimeLabel time={this.currentTime}/>
          </div>
          <div className="durationInputContainer">
            <div className="label">Duration (m:s):</div>
            <input ref="minutesElapsedInput" defaultValue="00"/> : <span> </span>
            <input ref="secondsElapsedInput" defaultValue="00"/>
          </div>
          <div className="notesInputContainer">
            <div className="label">What happened:</div>
            <input ref="noteInput"/>
          </div>
          <div className="locationInputContainer">
            <div className="label">Location:</div>
            <input ref="otherLocationInput" defaultValue={ this.currentLocation }/>
          </div>
          <div>
            <div className="label"></div> <input type="submit"/>
          </div>
        </form>
      </div>
    )
  }
  handleFormSubmit(event, whichForm) {
    event.preventDefault();
    let day, hour, minute, second, note, location;
    if (whichForm == 1) {
      day = this.refs.dayInput.value;
      hour = this.refs.hourInput.value;
      minute = this.refs.minuteInput.value;
      second = this.refs.secondInput.value;
      note = null;
      location = this.refs.locationInput.value;
    }
    else {
      second = this.currentTime.second + parseInt(this.refs.secondsElapsedInput.value);
      minute = this.currentTime.minute + parseInt(this.refs.minutesElapsedInput.value);
      hour = this.currentTime.hour;
      day = parseInt(this.currentTime.day);
      note = this.refs.noteInput.value;
      location = this.refs.otherLocationInput.value;
      if (second >= 60) {
        minute += Math.floor(second / 60)
        second = second % 60;
      }
      if (minute >= 60) {
        hour = parseInt(hour) + Math.floor(minute / 60)
        minute = minute % 60;
      }
      if (hour >= 24) {
        day += Math.floor(hour / 24);
        hour = hour % 24;
      }
    }

    if (day != this.currentTime.day || hour != this.currentTime.hour ||
        minute != this.currentTime.minute || second != this.currentTime.second) {
      this.props.dispatch({ type: actions.CREATE_NOTE, data: {
        topic: "time",
        text: note,
        json: { day, hour, minute, second }
      }})
    }

    if (location !== this.currentLocation) {
      this.props.dispatch({ type: actions.CREATE_NOTE, data: {
        topic: "location", text: location
      }})
    }
  }
  handleLocationFormSubmit(event) {
    event.preventDefault();
    this.setState({ locationCardShown: false, locationInput: "" })
  }
  handleNoteFormSubmit(event) {
    event.preventDefault();
    this.setState({ locationCardShown: false, timeCardShown: false });
    this.props.dispatch({ type: actions.CREATE_NOTE, data: event.form })
  }
}
const mapState = (state) => {
  return Object.assign({}, state);
}
export default connect(mapState)(ChronicleView)

