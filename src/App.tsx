import React, { Component } from 'react';
import { Toast, ToastBody } from 'reactstrap';
import './App.scss';
import Score from './Score';
import UserView1 from './UserView2';
import { MatchPacket, Player } from './websocket/packet';
import { TASocket } from './websocket/socket';

export default class App extends Component<any, { infoToast: string, infoToastShow: boolean, match?: MatchPacket }> {
  socket?: TASocket;

  constructor(props: any) {
    super(props);
    this.state = {
      infoToast: "",
      infoToastShow: false,
      match: undefined
    }
  }

  componentDidMount() {
    var props = window.location.search.substr(1).split(',').map(t => t.split('=')).reduce<{ [id: string]: string }>((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, { host: window.location.hostname });
    props = window.location.hash.substr(1).split(',').map(t => t.split('=')).reduce<{ [id: string]: string }>((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, props);
    this.socket = new TASocket(props.host, props.password, true);
    this.socket.on("coordinatorChanged", this.coordinatorChanged.bind(this));
    this.socket.on("matchChanged", this.handleMatchEvent.bind(this));
    this.socket.on("log", this.handleLog.bind(this));
  }

  handleLog(data: string) {
    this.setState({ infoToast: data, infoToastShow: true }, this.hideToast);
  }

  handleMatchEvent(data: MatchPacket) {
    this.setState({ match: data });
  }

  coordinatorChanged(data: string | undefined) {
    this.setState({ infoToast: `New Coordinator assigned: ${!!data ? this.socket?.coordinators.get(data) : "None assigned"}`, infoToastShow: true }, this.hideToast);
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
    if (!!this.state.match) {
      if (!this.state.match?.Players.find(t => t.Team.Name == "None")) {
        var groupedTeam = this.state.match.Players.reduce<{ [id: string]: Player[] }>((pv, cv) => {
          if (!pv.hasOwnProperty(cv.Team.Id)) pv[cv.Team.Id] = [];
          pv[cv.Team.Id].push(cv);
          return pv;
        }, {});
      }
      else {
        fillWidth = this.state.match.Players[0].Accuracy - this.state.match.Players[1].Accuracy;
        fillWidth *= 1000;
        fillWidth = Math.round(fillWidth);
        team1.accuracy = this.state.match.Players[0].Accuracy;
        team2.accuracy = this.state.match.Players[1].Accuracy;
        team1.score = this.state.match.Players[0].Score;
        team2.score = this.state.match.Players[1].Score;
        team1.name = this.state.match.Players[0].Name;
        team2.name = this.state.match.Players[1].Name;
      }
    }
    return (
      <div className="App">
        <div>
          <Score></Score>
        </div>
        <div style={{ display: "flex", marginTop: 100, position: "relative" }}>
          <UserView1 fill={fillWidth > 0 ? Math.min(fillWidth, 100) : 0} percent={team1.accuracy} score={team1.score}>{team1.name}</UserView1>
          <UserView1 right fill={fillWidth < 0 ? Math.min(Math.abs(fillWidth), 100) : 0} percent={team2.accuracy} score={team2.score}>{team2.name}</UserView1>
        </div>
        <div style={{ position: "fixed", bottom: 0, right: 0 }}>
          <Toast isOpen={this.state.infoToastShow} color="warning">
            <ToastBody>
              {this.state.infoToast}
            </ToastBody>
          </Toast>
        </div>
      </div>
    );
  }
}
