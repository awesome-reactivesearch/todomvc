import Appbase from 'appbase-js'; // installed alongside reactivesearch-native

import CONFIG from '../constants/Config';
import Utils from './utils'

class TodoModel {
  constructor(key) {
    this.key = key;
    this.todos = [];
    this.onChanges = [];
    this.appbaseRef = new Appbase({
      url: CONFIG.url,
      app: CONFIG.app,
      credentials: CONFIG.credentials,
    });

    this.appbaseRef
      .search({
        type: CONFIG.type,
        size: 1000,
        body: {
          query: {
            match_all: {}
          }
        }
      })
      .on("data", ({ hits: { hits = [] } = {} } = {}) => {
        this.todos = hits.map(({ _source = {} } = {}) => _source);
        this.inform();
        console.log("search, match: ", hits);
      })
      .on("error", error => {
        console.log("caught a search error: ", error);
      });

    this.appbaseRef
      .searchStream({
        type: CONFIG.type,
        body: {
          query: {
            match_all: {}
          }
        }
      })
      .on("data", stream => {
        let { _deleted, _source } = stream;

        if (_deleted) {
          this.todos = this.todos.filter(function (candidate) {
            return candidate.id !== _source.id;
          });
        } else if (_source) {
          const todo = this.todos.find(({ id }) => id == _source.id);
          todo ? Object.assign(todo, _source) : this.todos.unshift(_source);
        }

        // this.todos = hits.map(({_source = {}} = {}) => _source)
        this.inform();
        console.log("searchStream, new match: ", stream);
      })
      .on("error", error => {
        console.log("caught a searchStream, error: ", error);
      });
  }

  subscribe(onChange) {
    this.onChanges.push(onChange);
  }

  inform() {
    // Utils.store(this.key, this.todos)
    // this.todos = [...this.todos]
    this.onChanges.forEach(cb => {
      cb();
    });
  }

  addTodo(title) {
    const id = Utils.uuid();
    const jsonObject = {
      id,
      title,
      completed: false,
      createdAt: Date.now()
    };

    // optimistic logic
    this.todos = [jsonObject].concat(this.todos);
    this.inform();

    // broadcast all changes
    this.appbaseRef
      .index({
        type: CONFIG.type,
        id: id,
        body: jsonObject
      })
      .on("data", function (response) {
        console.log(response);
      })
      .on("error", function (error) {
        console.log(error);
      });
  }

  toggleAll(checked) {
    // Note: it"s usually better to use immutable data structures since they"re
    // easier to reason about and React works very well with them. That"s why
    // we use map() and filter() everywhere instead of mutating the array or
    // todo items themselves.
    this.todos = this.todos.map(todo => ({
      ...todo,
      completed: checked
    }));
    this.inform();

    // broadcast all changes
    this.todos.forEach(todo => {
      console.log('todo: ', todo);
      const { id, ...todoData } = todo;
      this.appbaseRef.update({
        type: CONFIG.type,
        id: id,
        body: {
          doc: {
            ...todoData
          }
        }
      });
    });
  }

  toggle(todoToToggle) {
    // optimistic logic
    this.todos = this.todos.map(todo => {
      return todo !== todoToToggle
        ? todo
        : {
          ...todo,
          completed: !todo.completed
        };
    });
    this.inform();

    const { id, ...todoData } = todoToToggle;

    // broadcast all changes
    this.appbaseRef
      .update({
        type: CONFIG.type,
        id: id,
        body: {
          doc: {
            ...todoData,
            completed: !todoData.completed
          }
        }
      })
      .on("data", function (response) {
        console.log(response);
      })
      .on("error", function (error) {
        console.log(error);
      });
  }

  destroy(todo) {
    // optimistic logic
    this.todos = this.todos.filter(candidate => {
      return candidate !== todo;
    });
    this.inform();

    // broadcast all changes
    this.appbaseRef
      .delete({
        type: CONFIG.type,
        id: todo.id
      })
      .on("data", function (response) {
        console.log(response);
      })
      .on("error", function (error) {
        console.log(error);
      });
  }

  save(todoToSave, text) {
    // optimistic logic
    this.todos = this.todos.map(todo => {
      return todo !== todoToSave
        ? todo
        : {
          ...todo,
          title: text
        };
    });
    this.inform();

    const { id, ...todoData } = todoToSave;

    // broadcast all changes
    this.appbaseRef
      .update({
        type: CONFIG.type,
        id: id,
        body: {
          doc: {
            ...todoData,
            title: text
          }
        }
      })
      .on("data", function (response) {
        console.log(response);
      })
      .on("error", function (error) {
        console.log(error);
      });
  }

  clearCompleted() {
    let completed = this.todos.filter(todo => todo.completed);

    // optimistic logic
    this.todos = this.todos.filter(todo => !todo.completed);
    this.inform();

    // broadcast all changes
    completed.forEach(todo => {
      this.appbaseRef.delete({
        type: CONFIG.type,
        id: todo.id
      });
    });
  }
}

export default TodoModel;
