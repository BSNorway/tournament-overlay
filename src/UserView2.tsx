import React, { Component } from "react";
import textFit from "textfit";
import "./UserView2.scss";

export default class UserView1 extends Component<{ right?: boolean, percent: number, score: number, fill: number }> {
    textRef = React.createRef<HTMLSpanElement>();

    componentDidMount() {
        textFit(this.textRef.current as HTMLSpanElement);
    }

    componentDidUpdate() {
        textFit(this.textRef.current as HTMLSpanElement);
    }

    render() {
        return (
            <div className={`userView ${this.props.right ? "right" : ""}`}>
                <div className="tug">
                    <div className="fill" style={{ width: this.props.fill }}></div>
                </div>
                <div className="divisor"></div>
                <div className="name">
                    <span ref={this.textRef}>{this.props.children}</span>
                </div>
                <div className={"score" + (this.props.fill > 0 ? " lead" : "")}>
                    <span className="percent">{this.props.percent}%
                    </span>
                    <span className="number">{this.props.score}
                    </span>
                </div>
            </div>
        );
    }
}