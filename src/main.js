var React = require('react');
var ReactDOM = require('react-dom');

var tasks = [];
var strage = localStorage;

var Header = React.createClass({
  render: function() {
    return (
      <header className="toolbar toolbar-header">
      <div className="toolbar-button">
      <button type="button" className="toolbar-button-item close" id="close"></button>
      <button type="button" className="toolbar-button-item minimize" id="minimize"></button>
      <button type="button" className="toolbar-button-item fullscreen" id="fullscreen"></button>
      </div>

      <h1 className="title">Task Timer</h1>
      </header>
    );
  }
});

var Task = React.createClass({
  render: function() {
    return (
      <div className="list-group-item">
      <div className="media-body">
      <strong>{this.props.children}</strong>
      </div>
      </div>
    );
  }
});

var TaskList = React.createClass({
  render: function() {
    tasks = this.props.tasks !== null ? this.props.tasks : tasks;
    if(tasks.length !== 0) {
      var taskNodes = this.props.tasks.map(function(task) {
        return (
          <Task>{task.name}</Task>
        );
      });
    } else {
      var taskNodes = function(){
        return (
          <Task></Task>
        );
      };
    }
    return (
      <div className="window-content">
      <div className="list-group">
      {taskNodes}
      </div>
      </div>
    );
  }
});

var AddTaskBox = React.createClass({
  hundleSubmit: function(e) {
    e.preventDefault();
    var task = ReactDOM.findDOMNode(this.refs.name).value.trim();
    if(task !== '') {
      tasks.push({name: task});
      this.props.onTaskSubmit({name: task});
    }

    if(strage.getItem('tasks') !== null) {
      var storedTasks = strage.getItem('tasks');
    } else {
      var storedTasks = strage;
    }

    strage.setItem('tasks', JSON.stringify(tasks));

    ReactDOM.findDOMNode(this.refs.name).value = '';
  },
  render: function() {
    return (
      <div className="add-task sidebar">
      <form className="add-task-form" onSubmit={this.hundleSubmit}>
      <div className="form-group">
      <input className="form-control" type="text" placeholder="Task name" ref="name" />
      </div>

      <div className="form-actions">
      <button className="btn btn-form btn-primary pull-right">Add</button>
      </div>
      </form>
      </div>
    );
  }
});

var Footer = React.createClass({
  render: function() {
    return (
      <footer className="toolbar toolbar-footer">
      <div className="toolbar-actions">
      </div>
      </footer>
    );
  }
});

var AppBox = React.createClass({
  getInitialState: function() {
    return {tasks: JSON.parse(strage.getItem('tasks'))};
  },
  componentDidMount: function() {
    this.props = {tasks: JSON.parse(strage.getItem('tasks'))};
    this.setState({tasks: this.state.tasks});
  },
  hundleTaskSubmit: function(task) {
    tasks = this.state.tasks !== null ? this.state.tasks : tasks;
    this.setState({tasks: tasks});
  },
  render: function() {
    return (
      <div className="window">
      <Header />
      <TaskList tasks={this.state.tasks} />
      <AddTaskBox onTaskSubmit={this.hundleTaskSubmit} />
      <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <AppBox tasks={tasks} />,
  document.getElementById('app-box')
);
