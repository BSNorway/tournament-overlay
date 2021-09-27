import React, { Component } from "react";
import "./Score.scss";
export default class Score extends Component {
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
                        <div className={"point" + (0/* add point logic for team 1 here*/ > i ? "" : " hidden")} style={{ left: 65 - i * 65 }}></div>
                    ))
                }
                {
                    Array.apply(null, Array(2)).map((_, i) => (
                        <div className={"point reverse" + (0/* add point logic for team 2 here*/ > i ? "" : " hidden")} style={{ right: 65 - i * 65 }}></div>
                    ))
                }
                <div className="devider">{0/* add point logic for team 1 here*/} - {0/* add point logic for team 2 here*/}</div>
            </div>
        </div>);
    }
}