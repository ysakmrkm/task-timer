var React = require('react');
var ReactDOM = require('react-dom');
var classNames = require('classnames');
var electron = electronRequire('electron');
var ipcRenderer = electron.ipcRenderer;
var appWindow = electron.remote.getCurrentWindow();

var strage = localStorage;

var id = JSON.parse(strage.getItem('id')) !== null ? JSON.parse(strage.getItem('id')) + 1 : 0;

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

var NameContent = React.createClass({
  componentWillMount(e) {
    this.setState({content: this.props.content, isClick: this.props.isClick})
  },
  handleRename: function(e) {
    var taskName = this.state !== null ? this.state.content : this.props.content

    if(this.state !== null && this.state.isClick) {
      this.setState({isClick: false})
    } else {
      this.setState({content: taskName, isClick: true})
    }
  },
  handleKeyPress: function(e) {
    if(e.key === 'Enter') {
      var name = ReactDOM.findDOMNode(this.refs.name).value.trim();

      if(name !== '') {
        this.setState({content: name, isClick: false},function() {
          this.props.onChange(this)
        })
      }
    }
  },
  render: function() {
    var taskName = this.state !== null ? this.state.content : this.props.content
    if(this.state !== null && this.state.isClick) {
      var renderContent = <input type='text' defaultValue={taskName} onKeyPress={this.handleKeyPress} ref='name' required='required' />
    } else {
      var renderContent = <strong>{taskName}<span className="icon icon-pencil" onClick={this.handleRename}></span></strong>
    }

    return (
      renderContent
    );
  }
});

var TaskName = React.createClass({
  handleChange: function(e) {
    this.setState(e.state, function() {
      this.props.onChange(this)
    })
  },
  render: function() {
    var nameContent = <NameContent content={this.props.name.content} isClick={false} onChange={this.handleChange}></NameContent>

    return (
      <header className="task-item-name task-item-contents">
      {nameContent}
      </header>
    );
  }
});

var TaskTime = React.createClass({
  render: function() {
    var now = this.state !== null ? this.state.time : this.props.time
    var hours = Math.floor(now / 60 / 60);
    var minutes = Math.floor(now / 60 % 60);
    var seconds = now % 60;
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
    if(this.isMounted()) {
      this.setState({time: this.state.time + 1}, function(){
        var currentTask = this.state;
        var storedTasks = JSON.parse(strage.getItem('tasks'));

        Object.keys(storedTasks).forEach(function(key){
          if(storedTasks[key].id === currentTask.id) {
            storedTasks[key].time = currentTask.time;
            storedTasks[key].isStart = currentTask.isStart;
            strage.setItem('tasks', JSON.stringify(storedTasks));
          }
        });

        this.props.onStart(this.state)
      });
    }
  },
  handleStart: function(e) {
    var task = this.state !== null ? this.state : this.props.task;

    this.setState({name: task.name, time: task.time, isStart: true}, function(){
      var currentTask = this.state;
      var storedTasks = JSON.parse(strage.getItem('tasks'));

      Object.keys(storedTasks).forEach(function(key){
        if(storedTasks[key].id === currentTask.id) {
          storedTasks[key].time = currentTask.time;
          storedTasks[key].isStart = currentTask.isStart;
          strage.setItem('tasks', JSON.stringify(storedTasks));
        }
      });

      this.props.onStart(this.state)
    });

    this.interval = setInterval(this.tick, 1000);
  },
  handlePause: function(e) {
    clearInterval(this.interval);

    this.setState({name: this.state.name, time: this.state.time, isStart: false}, function(){
      var currentTask = this.state;
      var storedTasks = JSON.parse(strage.getItem('tasks'));

      Object.keys(storedTasks).forEach(function(key){
        if(storedTasks[key].id === currentTask.id) {
          storedTasks[key].isStart = currentTask.isStart;
          strage.setItem('tasks', JSON.stringify(storedTasks));
        }
      });

      this.props.onPause(this.state)
    });
  },
  handleReset: function(e) {
    clearInterval(this.interval);

    this.setState({time: 0, isStart: false}, function(){
      var currentTask = this.state;
      var storedTasks = JSON.parse(strage.getItem('tasks'));

      Object.keys(storedTasks).forEach(function(key){
        if(storedTasks[key].id === currentTask.id) {
          storedTasks[key].time = 0;
          storedTasks[key].isStart = false;
          strage.setItem('tasks', JSON.stringify(storedTasks));
        }
      });

      this.props.onReset(this.state)
    });
  },
  handleRemove: function(e) {
    clearInterval(this.interval);

    this.props.onRemove(this.state)
  },
  handleChange: function(e) {
    this.setState({name: e.state}, function() {
      this.props.onNameChange(this)
    })
  },
  componentWillMount(e) {
    this.setState(this.props.task)
  },
  componentWillReceiveProps: function(nextProps) {
    if(this.state.id !== nextProps.task.id) {
      this.setState(nextProps.task, function(){
        if(nextProps.task.isStart) {
          this.handleStart()
        }
      })
    }
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  render: function() {
    var now = this.state !== null ? this.state : this.props.task

    var classNameButtonRemove = classNames({
      'icon': true,
      'icon-trash': true,
      'is-active': true
    });

    var classNameButtonReset = classNames({
      'icon': true,
      'icon-cancel': true,
      'is-active': true
    });

    var classNameButtonPause = classNames({
      'icon': true,
      'icon-pause': true,
      'is-active': now.isStart
    });

    var classNameButtonStart = classNames({
      'icon': true,
      'icon-play': true,
      'is-active': !now.isStart
    });

    return (
      <div className="task-item list-group-item">
      <div className="task-item-inner media-body">
      <TaskName name={now.name} onChange={this.handleChange} />
      <TaskTime time={now.time} />
      <footer className="task-item-buttons task-item-contents">
      <span className={classNameButtonRemove} onClick={this.handleRemove}></span>
      <span className={classNameButtonReset} onClick={this.handleReset}></span>
      <span className={classNameButtonPause} onClick={this.handlePause}></span>
      <span className={classNameButtonStart} onClick={this.handleStart}></span>
      </footer>
      </div>
      </div>
    );
  }
});

var TaskList = React.createClass({
  componentWillReceiveProps: function(e) {
    this.setState({tasks: e.tasks})
  },
  changeName: function(task){
    var updateTask = task.state;

    this.setState({tasks: updateTask}, function() {
      var storedTasks = JSON.parse(strage.getItem('tasks'));
      var currentTask = this.state;

      Object.keys(storedTasks).forEach(function(key){
        if(storedTasks[key].id === updateTask.id) {
          storedTasks[key].name.content = updateTask.name.content;
          strage.setItem('tasks', JSON.stringify(storedTasks));
        }
      });
    })
  },
  startTask: function(task){
    var updateTasks = this.props.tasks;

    this.props.tasks.forEach(function(val, index) {
      if(task.id === val.id) {
        updateTasks[index] = task
      }
    });

    this.setState({tasks: updateTasks}, function(){
      var activeCount = 0;
      updateTasks.forEach(function(task){
        if(task.isStart) {
          activeCount++;
        }
      })

      ipcRenderer.send("activeCount", activeCount);
    })
  },
  pauseTask: function(task){
    var updateTasks = this.props.tasks;

    this.props.tasks.forEach(function(val, index) {
      if(task.id === val.id) {
        updateTasks[index] = task
      }
    });

    this.setState({tasks: updateTasks}, function(){
      var activeCount = 0;
      updateTasks.forEach(function(task){
        if(task.isStart) {
          activeCount++;
        }
      })

      ipcRenderer.send("activeCount", activeCount);
    })
  },
  resetTask: function(task){
    var updateTasks = this.props.tasks;

    this.props.tasks.forEach(function(val, index) {
      if(task.id === val.id) {
        updateTasks[index] = task
      }
    });

    this.setState({tasks: updateTasks}, function(){
      var activeCount = 0;
      updateTasks.forEach(function(task){
        if(task.isStart) {
          activeCount++;
        }
      })

      ipcRenderer.send("activeCount", activeCount);
    })
  },
  removeTask: function(task){
    this.props.onTaskRemove(task)
  },
  render: function() {
    var renderTasks = this.props.tasks;

    if(renderTasks !== null && renderTasks.length !== 0) {
      var nameChangeFunc = this.changeName;
      var addTaskFunc = this.addTask;
      var removeTaskFunc = this.removeTask;
      var startTaskFunc = this.startTask;
      var pauseTaskFunc = this.pauseTask;
      var resetTaskFunc = this.resetTask;
      var taskNodes = renderTasks.map(function(task) {
        return (
          <Task
            key={task.id}
            task={task}
            onNameChange={nameChangeFunc}
            onAdd={addTaskFunc}
            onStart={startTaskFunc}
            onPause={pauseTaskFunc}
            onReset={resetTaskFunc}
            onRemove={removeTaskFunc}
          ></Task>
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
      this.props.onTaskSubmit({id: id, name: {content: task, isClick: false}, time: time, isStart: isStart});
    }

    ReactDOM.findDOMNode(this.refs.name).value = '';
    id++;
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
    var initialTasks = JSON.parse(strage.getItem('tasks')) !== null ? JSON.parse(strage.getItem('tasks')) : this.props.tasks
    var initialArchives = JSON.parse(strage.getItem('archives')) !== null ? JSON.parse(strage.getItem('archives')) : this.props.archives

    initialTasks.forEach(function(task){
      task.isStart = false;
    })

    strage.setItem('tasks', JSON.stringify(initialTasks));
    strage.setItem('archives', JSON.stringify(initialArchives));

    return {tasks: initialTasks, archives: initialArchives};
  },
  componentWillReceiveProps: function(e) {
    this.setState(e.task)
  },
  hundleTaskSubmit: function(task) {
    var addTask = JSON.parse(strage.getItem('tasks')) !== null ? JSON.parse(strage.getItem('tasks')) : [];

    addTask.push(task)

    this.setState({tasks: addTask}, function(){
      strage.setItem('tasks', JSON.stringify(addTask));
      strage.setItem('id', JSON.stringify(task.id));
    });
  },
  handleTaskRemove: function(task) {
    var remainTasks = this.state.tasks
    var removeTask = task
    var archivedTasks = JSON.parse(strage.getItem('archives')) !== null ? JSON.parse(strage.getItem('archives')) : [];

    remainTasks = remainTasks.filter(function(task) {
      return task.id !== removeTask.id
    })

    strage.setItem('tasks', JSON.stringify(remainTasks));

    this.setState({ tasks: remainTasks }, function(){
      var activeCount = 0;
      remainTasks.forEach(function(task){
        if(task.isStart) {
          activeCount++;
        }
      })

      ipcRenderer.send("activeCount", activeCount);
    })

    archivedTasks.push(removeTask)

    strage.setItem('archives', JSON.stringify(archivedTasks));
  },
  render: function() {
    return (
      <div className="window">
      <Header />
      <TaskList tasks={this.state.tasks} onTaskRemove={this.handleTaskRemove} />
      <AddTaskBox onTaskSubmit={this.hundleTaskSubmit} />
      <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <AppBox tasks={[]} archives={[]} />,
  document.getElementById('app-box'),
  function() {
    appWindow.show()
  }
);
