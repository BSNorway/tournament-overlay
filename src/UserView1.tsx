import React, { Component } from "react";
import "./UserView1.scss";

export default class UserView1 extends Component<{ right?: boolean }> {
    render() {
        return (
            <div className={`userView ${this.props.right ? "right" : ""}`}>
                <div className="tug">
                    <div className="fill"></div>
                </div>
                <div className="divisor"></div>
                <div className="name">
                    <span>{this.props.children}</span>
                </div>
                <div className="score">
                    <span className="percent">95.24%
                    </span>
                    <span className="number">398662
                    </span>
                </div>
            </div>
        );
    }
}