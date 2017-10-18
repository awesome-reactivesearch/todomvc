// Based on: https://github.com/tastejs/todomvc/blob/gh-pages/examples/react/js/footer.jsx

import React, { Component } from "react";
import classNames from "classnames";
import {
  ToggleButton,
  ReactiveElement,
  DataController
} from "@appbaseio/reactivesearch";

import Utils from "./utils";

class TodoFooter extends Component {

  onAllData (data) {
    // merging all streaming and historic data
    var todosData = Utils.mergeTodos(data);

    let activeTodoCount = todosData.reduce((accum, todo) => {
      return todo._source.completed ? accum : accum + 1
    }, 0)

    let activeTodoWord = Utils.pluralize(activeTodoCount, "item");

    return(
      <span className="todo-count">
        <strong>{activeTodoCount}</strong> {activeTodoWord} left
      </span>
    )
  }

  render () {
    let clearButton = null;
    let { completedCount, onClearCompleted, nowShowing } = this.props;

    if (completedCount > 0) {
      clearButton = (
        <button
          className="clear-completed"
          onClick={onClearCompleted}>
          Clear completed
        </button>
      )
    }

    return (
      <footer className="footer">
        <DataController
          componentId="ActiveCountSensor"
          visible={false}
          showFilter={false}
          customQuery={
            function(value) {
              return {
                query: {
                  match_all: {}
                }
              }
            }
          }
        />
        <ReactiveElement
          componentId="ActiveCount"
          stream={true}
          showResultStats={false}
          onAllData={this.onAllData.bind(this)}
          react={{
            or: ["ActiveCountSensor"]
          }}
        />
        <ul className="filters">
          <ToggleButton
            componentId="FiltersSensor"
            dataField="completed"
            defaultSelected={[nowShowing]}
            multiSelect={false}
            onValueChange={this.props.handleToggle}
            customQuery={
              function() {
                return {
                  query: {
                    match_all: {}
                  }
                }
              }
            }
            data={
              [
                {"label": "all",        "value": "all"},
                {"label": "active",     "value": "active"},
                {"label": "completed",  "value": "completed"}
              ]
            }
          />
        </ul>
        {clearButton}
      </footer>
    )
  }
}

export default TodoFooter;
