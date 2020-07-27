import { v4 as uuidv4 } from "uuid";
import { w3cwebsocket as WebSocket } from "websocket"
import EventEmitter from "eventemitter3"
import config from "../config"

const DEBUG = config("DEBUG");
const HEARTBEAT = config("HEARTBEAT");

class EchoConnector extends EventEmitter {
  static getEndpoint() {
    const scheme = window.location.protocol == "https:" ? "wss" : "ws";
    return scheme + "://" + window.location.host + "/ws/map/";
  }
  open() {
    // TODO: authorization
    if (this.client) {
      switch (this.client.readyState) {
      case 0: /* opening */
        return this.openPromise;
      case 1: /* open */
        return Promise.resolve(this.client)
      default: /* closing or closed */
        this.client = null;
      }
    }
    return (this.openPromise = this.doOpen())
  }
  doOpen() {
    return new Promise((resolve, reject) => {
      this.client = new WebSocket(EchoConnector.getEndpoint())
      //
      this.client.onopen = () => {
        this.emit("socket.connect")
        this.pendingPongs = {}
        if (HEARTBEAT) {
          this.pingTimeout = setTimeout(() => this.pingAndOn(), 2000)
        }
        resolve(this.client)
      }
      //
      this.client.onclose = () => {
        this.emit("socket.disconnect")
      }
      //
      this.client.onmessage = (message) => {
        if (DEBUG) console.log("MESSAGE RECEIVED", message)
        const data = JSON.parse(message.data)
        if (data.type === "pong") {
          delete this.pendingPongs[data.uuid];
        }
        else {
          this.emit(`app.${data.type}`, data)
        }
      }
    })
  }
  close() {
    clearTimeout(this.pingTimeout)
    this.client = null;
  }
  pingAndOn() {
    const uuid = uuidv4()
    const event = { type: "ping", uuid }
    if (DEBUG) console.log("PINGING", event)
    this.client.send(JSON.stringify(event))
    this.pingTimeout = setTimeout(() => this.checkPong(uuid), 1000)
  }
  checkPong(uuid) {
    if (this.pendingPongs[uuid]) {
      this.client = null;
      this.emit("socket.poof")
    }
    else {
      this.pingTimeout = setTimeout(() => this.pingAndOn(), 2000)
    }
  }
  broadcast(event) {
    if (DEBUG) console.log("TO BE SENT", event)
    this.open().then((client) => {
      if (DEBUG) console.log("SENDING", event)
      client.send(JSON.stringify(event))
    })
  }
}

export const echoConnector = new EchoConnector();
export default echoConnector;
