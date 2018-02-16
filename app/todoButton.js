import React, { Component } from "react";
import classNames from "classnames";

import "./todomvc.scss";

class TodoButton extends Component {
  handleClick() {
    this.props.onClick(this.props.value);
  }

  render() {
    let cx = classNames("btn rbc-btn", {
      "rbc-btn-active": this.props.active,
      "rbc-btn-inactive": !this.props.active
    });
    return (
      <button className={cx} onClick={this.handleClick.bind(this)}>
        {this.props.label}
      </button>
    );
  }
}

export default TodoButton;
