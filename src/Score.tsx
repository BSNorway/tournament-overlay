import React, { Component } from "react";
import "./Score.scss";
export default class Score extends Component
{
    render(){
        return (<div id="scorebar">
            <div>
                <div className="line" style={{left:0}}></div>
                <div className="line" style={{left: 65}}></div>
                <div className="line" style={{left: 130}}></div>
                <div className="line reverse" style={{right: 0}}></div>
                <div className="line reverse" style={{right: 65}}></div>
                <div className="line reverse" style={{right: 130}}></div>
                <div className="point" style={{left:0}}></div>
                <div className="point" style={{left: 65}}></div>
                <div className="point reverse" style={{right: 0}}></div>
                <div className="point reverse" style={{right: 65}}></div>
                <div className="devider">2 - 0</div>
            </div>
        </div>);
    }
}