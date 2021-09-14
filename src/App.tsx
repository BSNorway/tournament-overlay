import React, { Component } from 'react';
import './App.scss';
import Score from './Score';
import UserView1 from './UserView2';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <Score></Score>
        </div>
        <div style={{ display: "flex", marginTop: 100, position: "relative" }}>
          <UserView1>WildWolf</UserView1>
          <div style={{ borderRight: "2px solid white", height: 722, position: "absolute", left: 959, zIndex: 99 }}></div>
          <UserView1 right>Acetari</UserView1>
        </div>
      </div>
    );
  }
}
