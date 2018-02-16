// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/footer.jsx

import React, { Component } from "react";
import classNames from "classnames";
import { DataController, ReactiveList } from "@appbaseio/reactivesearch";

import TodoButton from "./todoButton";
import Utils from "./utils";

const ALL_TODOS = "all";
const ACTIVE_TODOS = "active";
const COMPLETED_TODOS = "completed";

import "./todomvc.scss";

class TodoFooter extends Component {
  onAllData(todos, streamData) {
    // console.log('@onAllData - todos: ', todos);
    // console.log('@onAllData - streamData: ', streamData);
    const todosData = Utils.mergeTodos(todos, streamData);

    let activeTodoCount = todosData.reduce((accum, todo) => {
      return todo.completed ? accum : accum + 1;
    }, 0);

    let activeTodoWord = Utils.pluralize(activeTodoCount, "item");

    return (
      <span className="todo-count">
        <strong>{activeTodoCount}</strong> {activeTodoWord} left
      </span>
    );
  }

  render() {
    let clearButton = null;
    let { completedCount, onClearCompleted, nowShowing } = this.props;

    if (completedCount > 0) {
      clearButton = (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      );
    }

    return (
      <footer className="footer">
        <DataController
          componentId="ActiveCountSensor"
          visible={false}
          showFilter={false}
          customQuery={function (value) {
            return {
              match_all: {}
            };
          }}
        />
        <ReactiveList
          dataField="title"
          componentId="ActiveCount"
          stream={true}
          showResultStats={false}
          onAllData={this.onAllData.bind(this)}
          react={{
            or: ["ActiveCountSensor"]
          }}
          innerClass={{
            poweredBy: 'poweredBy'
          }}
          className="reactivelist"
        />
        <ul className="filters">
          <div className="rbc-buttongroup">
            <TodoButton
              label="All"
              value="all"
              active={this.props.nowShowing === ALL_TODOS}
              onClick={this.props.handleToggle}
            />
            <TodoButton
              label="Active"
              value="active"
              active={this.props.nowShowing === ACTIVE_TODOS}
              onClick={this.props.handleToggle}
            />
            <TodoButton
              label="Completed"
              value="completed"
              active={this.props.nowShowing === COMPLETED_TODOS}
              onClick={this.props.handleToggle}
            />
          </div>
        </ul>
        {clearButton}
      </footer>
    );
  }
}

export default TodoFooter;
