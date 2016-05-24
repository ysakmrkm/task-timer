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

var TaskName = React.createClass({
  render: function() {
    return (
      <header className="task-item-name task-item-contents">
      <strong>{this.props.name}</strong>
      </header>
    );
  }
});

var TaskTime = React.createClass({
  render: function() {
    var hours = Math.floor(this.props.time / 60 / 60);
    var minutes = Math.floor(this.props.time / 60 % 60);
    var seconds = this.props.time % 60;
    hours = hours.toString().length == 1 ? '0'+hours : hours;
    minutes = minutes.toString().length == 1 ? '0'+minutes : minutes;
    seconds = seconds.toString().length == 1 ? '0'+seconds : seconds;
    return (
      <div className="task-item-timer task-item-contents">{hours}:{minutes}:{seconds}</div>
    );
  }
});

var Task = React.createClass({
  tick: function() {
    this.setState({time: this.state.time + 1});
  },
  handleClick: function(e) {
    if(!this.state.isStart) {
      this.interval = setInterval(this.tick, 1000);
      this.setState({isStart: true});
    }
  },
  render: function() {
    this.state = this.state === null ? this.props.task : this.state;

    return (
      <div className="task-item list-group-item">
      <div className="task-item-inner media-body">
      <TaskName name={this.state.name} />
      <TaskTime time={this.state.time} />
      <footer className="task-item-buttons task-item-contents">
      <span className="icon icon-play" onClick={this.handleClick}></span>
      </footer>
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
          <Task task={task}></Task>
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
    var time = 0;
    var isStart = false;
    if(task !== '') {
      tasks.push({name: task, time: time, isStart: isStart});
      this.props.onTaskSubmit({name: task, time: time, isStart: isStart});
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
