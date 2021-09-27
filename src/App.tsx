import React, { Component } from 'react';
// import { Toast, ToastBody } from 'reactstrap';
import './App.scss';
import Score from './Score';
import UserView1 from './UserView2';
import { MatchPacket } from './websocket/packet';
import { TASocket } from './websocket/socket';

function toFixedDown(number: number, digits: number) {
  var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
    m = number.toString().match(re);
  return m ? parseFloat(m[1]) : number.valueOf();
};

export default class App extends Component<any, { infoToast: string[], infoToastShow: boolean, match?: MatchPacket }> {
  socket?: TASocket;

  constructor(props: any) {
    super(props);
    this.state = {
      infoToast: [""],
      infoToastShow: false,
      match: undefined
    }
    this.coordinatorChanged = this.coordinatorChanged.bind(this);
    this.handleMatchEvent = this.handleMatchEvent.bind(this);
    this.handleLog = this.handleLog.bind(this);
  }

  componentDidMount() {
    var props = window.location.search.substr(1).split('&').map(t => t.split('=')).reduce<{ [id: string]: string }>((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, { host: window.location.hostname });
    props = window.location.hash.substr(1).split('&').map(t => t.split('=')).reduce<{ [id: string]: string }>((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, props);
    this.socket = new TASocket(props.host, props.password, true);
    this.handleLog(JSON.stringify(this.socket));
    this.socket.on("coordinatorChanged", this.coordinatorChanged);
    this.socket.on("matchChanged", this.handleMatchEvent);
    this.socket.on("log", this.handleLog);
  }

  handleLog(data: string) {
    var arr = [data].concat(this.state.infoToast);
    this.setState({ infoToast: arr, infoToastShow: true }, this.hideToast);
  }

  handleMatchEvent(data: MatchPacket) {
    this.setState({ match: data });
  }

  coordinatorChanged(data: string | undefined) {
    this.state.infoToast.push(`New Coordinator assigned: ${!!data ? this.socket?.coordinators.get(data) : "None assigned"}`);
    this.setState({ infoToastShow: true }, this.hideToast);
  }

  hideToast() {
    setTimeout(() => {
      this.setState({ infoToastShow: false });
    }, 10000)
  }

  render() {
    var fillWidth = 0;
    var team1 = { score: 0, accuracy: 0, name: "WildWolf" }
    var team2 = { score: 0, accuracy: 0, name: "Acetari" }
    // var text = this.state.infoToast;
    if (!!this.state.match && this.state.match.Players.length >= 2) {
      fillWidth = this.state.match.Players[0].Accuracy - this.state.match.Players[1].Accuracy;
      fillWidth = Math.round(fillWidth * 1000);
      team1.accuracy = toFixedDown(this.state.match.Players[0].Accuracy * 100, 2);
      team2.accuracy = toFixedDown(this.state.match.Players[1].Accuracy * 100, 2);
      team1.score = this.state.match.Players[0].Score;
      team2.score = this.state.match.Players[1].Score;
      team1.name = this.state.match.Players[0].Name;
      team2.name = this.state.match.Players[1].Name;
    }
    return (
      <div className="App">
        <div>
          {/* <Score points={this.state.points}></Score> */}{/* this needs to be done tourney specific as this works differently each tourney */}
          {/* <Toast isOpen={true} color="warning">
            <ToastBody>
              {text.slice(0, 5).map(t => (<div>{t}<br /></div>))}
            </ToastBody>
          </Toast> */}
        </div>
        <div style={{ display: "flex", marginTop: 100, position: "relative" }}>
          <UserView1 fill={fillWidth > 0 ? Math.min(fillWidth, 100) : 0} percent={team1.accuracy} score={team1.score}>{team1.name}</UserView1>
          <UserView1 right fill={fillWidth < 0 ? Math.min(Math.abs(fillWidth), 100) : 0} percent={team2.accuracy} score={team2.score}>{team2.name}</UserView1>
        </div>
      </div>
    );
  }
}
