import React, { Component } from "react";
import "./Score.scss";
import { PointEvent } from "./websocket/packet";
export default class Score extends Component<{ points: PointEvent }> {
    render() {
        return (<div id="scorebar">
            <div>
                <div className="line" style={{ left: 0 }}></div>
                <div className="line" style={{ left: 65 }}></div>
                <div className="line" style={{ left: 130 }}></div>
                <div className="line reverse" style={{ right: 0 }}></div>
                <div className="line reverse" style={{ right: 65 }}></div>
                <div className="line reverse" style={{ right: 130 }}></div>
                {
                    Array.apply(null, Array(2)).map((_, i) => (
                        <div className={"point" + (this.props.points.Team1 > i ? "" : " hidden")} style={{ left: 65 - i * 65 }}></div>
                    ))
                }
                {
                    Array.apply(null, Array(2)).map((_, i) => (
                        <div className={"point reverse" + (this.props.points.Team2 > i ? "" : " hidden")} style={{ right: 65 - i * 65 }}></div>
                    ))
                }
                <div className="devider">{this.props.points.Team1} - {this.props.points.Team2}</div>
            </div>
        </div>);
    }
}