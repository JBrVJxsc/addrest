var React = require('react');
var ReactDOM = require('react-dom');
var Utils = require('./common').Utils;
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Alert = require('./common').Alert;
var ConfirmWindow = require('./common').ConfirmWindow;

var Index = React.createClass({
    getInitialState: function() {
        return {
            user: null,
            boards: [],
            error: {},
            work_info: {},
            deleting: null,
            editing: null
        };
    },
    getBoardEventHandlers: function() {
        return {
            handleOnEdit: function(e) {
                this.setState({
                    editing: e
                });
                this.refs.edit.show();
            }.bind(this),
            handleOnDelete: function(e) {
                this.setState({
                    deleting: e
                });
                this.refs.delete.show();
            }.bind(this)
        };
    },
    handleOnDelete: function(e) {
        console.log(e);
        if (e) {
            this.delete(this.state.deleting);
        } else {
            this.refs.delete.hide();
        }
    },
    handleOnAlertDismiss: function() {
        this.clearError();
    },
    handleOnLogin: function(email, password) {
        this.clearError();

        if (!Utils.validateEmail(email)) {
            this.setError("login", "Please enter a valid email address.");
            return;
        }

        this.login(email, password, false);
    },
    handleOnSignup: function(email, password) {
        this.clearError();

        if (!Utils.validateEmail(email)) {
            this.setError("signup", "Please enter a valid email address.");
            return;
        }

        if (password.length < 4) {
            this.setError("signup", "Password is too short.");
            return;
        }

        this.signup(email, password);
    },
    handleOnCreate: function(title) {
        this.clearError();

        if (title.trim().length === 0) {
            this.setError("create", "Please enter a valid title.");
            return;
        }

        this.create(title);
    },
    handleOnEdit: function(title) {
        this.clearError();

        console.log("handleOnEdit 1");

        if (title === null) {
            console.log("title is null");
            this.refs.edit.hide();
            return;
        }

        console.log("handleOnEdit 2");

        if (title.trim().length === 0) {
            this.setError("edit", "Please enter a valid title.");
            return;
        }

        this.edit(title);
    },
    work: function(worker, working, message) {
        var info = {};
        info[worker] = {
            working: working,
            message: message
        };
        this.setState({
            work_info: info
        });
    },
    stopWork: function() {
        this.setState({
            work_info: {}
        });
    },
    login: function(email, password, signup) {
        if (signup) {
            this.work("signup", true, "Logging...");
        } else {
            this.work("login", true, "Logging...");
        }

        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            this.stopWork();
            if (data.result === false) {
                this.setError("login", "Email and password do not match.");
            } else {
                this.refs.signup.hide();
                this.refs.login.hide();
                this.getBoards();
            }
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.login,
                data: data,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    signup: function(email, password) {
        this.work("signup", true, "Signing...");

        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            this.stopWork();
            if (data.result === false) {
                this.setError("signup", "Email address has been used.");
            } else {
                this.login(email, password, true);
            }
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.signup,
                data: data,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    logout: function() {
        this.work("logout", true, "Goodbye...");

        var callback = function(data) {
            this.stopWork();
            this.getBoards();
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.logout,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    create: function(title) {
        this.work("create", true, "Creating...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("create", "Board title has been used.");
            } else {
                this.refs.create.hide();
                this.getBoards();
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("create", "Something was wrong...");
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.create,
                data: {
                    title: title
                },
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    edit: function(title) {
        this.work("edit", true, "Saving...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("edit", "Board title has been used.");
            } else {
                this.refs.edit.hide();
                this.getBoards();
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("edit", "Something was wrong...");
        }.bind(this);

        console.log(this.state);

        var data = {
            id: this.state.editing.id,
            title: title
        };

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.edit,
                data: data,
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    delete: function(board) {
        this.work("delete", true, "Deleting...");

        var callback = function(data) {
            console.log(data);
            this.refs.delete.hide();
            this.stopWork();
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.delete,
                data: board,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 1500);
    },
    getBoards: function() {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.boards,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        boards: data.result.boards,
                        user: data.result.user
                    });
                }
            }.bind(this)
        });
    },
    setError: function(worker, message) {
        var error = {};
        error[worker] = {
            message: message
        };
        this.setState({
            error: error
        });
    },
    clearError: function() {
        this.setState({
            error: {}
        });
    },
    getButtons: function() {
        if (this.state.user) {
            return {
                left: [{
                        onClick: function () {
                            this.clearError();
                            this.refs.create.show();
                        }.bind(this),
                        text: "Create"
                    }],
                right: [{
                        onClick: function () {
                            this.logout();
                        }.bind(this),
                        text: "Log out",
                        working: true
                    }]
            }
        } else {
            return {
                left: null,
                right: [
                    {
                        onClick: function () {
                            this.clearError();
                            this.refs.signup.show();
                        }.bind(this),
                        text: "Sign up"
                    },
                    {
                        onClick: function () {
                            this.clearError();
                            this.refs.login.show();
                        }.bind(this),
                        text: "Log In"
                    }
                ]
            };
        }
    },
	componentDidMount: function() {
        this.getBoards();
	},
	render: function() {
		return (
			<div>
				<Modal ref="login" type="WaveModal">
                    <Login workInfo={this.state.work_info.login} error={this.state.error.login} onLogin={this.handleOnLogin} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup workInfo={this.state.work_info.signup} error={this.state.error.signup} onSignup={this.handleOnSignup} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="create" type="WaveModal">
                    <Create workInfo={this.state.work_info.create} error={this.state.error.create} onCreate={this.handleOnCreate} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="edit" type="WaveModal">
                    <Edit board={this.state.editing} workInfo={this.state.work_info.edit} error={this.state.error.edit} onCreate={this.handleOnEdit} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="delete" type="WaveModal">
                    <ConfirmWindow workInfo={this.state.work_info.delete} title="Are you sure?" onConfirm={this.handleOnDelete} />
                </Modal>
				<Navbar workInfo={this.state.work_info.logout} user={this.state.user} defaultTitle="Boards" ref="navbar" buttons={this.getButtons()} />
                <BoardListPanel user={this.state.user} boards={this.state.boards} onBoardEvents={this.getBoardEventHandlers()} />
			</div>
		);
	}
});

var BoardListPanel = React.createClass({
    render: function() {
        return (
            <div className="BoardListPanel box-shadow--3dp">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <BoardListToolbar />
                    </div>
                    <div className="panel-body">
                        <BoardList user={this.props.user} boards={this.props.boards} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Show more</button>
                    </div>
                </div>
            </div>
        );
    }
});

var BoardListToolbar = React.createClass({
    handleOnChange: function(e) {
        this.props.onSearch({
            keyword: e
        });
    },
    render: function() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-4">
                        <SearchTextBox onChange={this.handleOnChange}/>
                    </div>
                </div>
            </div>
        );
    }
});

var SearchTextBox = React.createClass({
    render: function() {
        return (
            <div className="inner-addon left-addon">
                <i className="glyphicon glyphicon-search"></i>
                <Input placeholder="Search Boards" onChange={this.props.onChange}></Input>
            </div>
        );
    }
});

var BoardList = React.createClass({
    getBoards: function() {
        var rows = [];
        var boards = this.props.boards;
        for (var i in boards) {
            if (boards[i].show) {
                rows.push(
                    <div key={i} className="col-xs-4">
                        <Board user={this.props.user} board={boards[i]} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                );
            }
        }
        return rows;
    },
    render: function() {
        return (
            <div className="container-fluid">
                <div className="row">
                    {this.getBoards()}
                </div>
            </div>
        );
    }
});

var Board = React.createClass({
    render: function() {
        return (
            <div className="Board box-shadow--3dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <BoardToolbar board={this.props.board} user={this.props.user} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                    <div className="panel-body">
                        <b>
                            Left
                            <span className="pull-right">Right</span>
                        </b>
                        <hr className="Separator" />
                        Info1
                        <hr className="Separator" />
                        Info2
                    </div>
				</div>
            </div>
        );
    }
});

var BoardToolbar = React.createClass({
    handleOnEdit: function() {
        this.props.onBoardEvents.handleOnEdit(this.props.board);
    },
    handleOnDelete: function() {
        this.props.onBoardEvents.handleOnDelete(this.props.board);
    },
    getTitle: function() {
        if (this.props.user) {
            if (this.props.board.email) {
                if (this.props.user.email === this.props.board.email) {
                    return (
                        <div className="HalfTitle">
                            {this.props.board.title}
                        </div>
                    );
                }
            }
        }
        return (
            <div className="FullTitle">
                {this.props.board.title}
            </div>
        );
    },
    getButtons: function() {
        if (this.props.user) {
            if (this.props.board.email) {
                if (this.props.user.email === this.props.board.email) {
                    return (
                        <div className="pull-right">
                            <button ref="edit" type="button" className="btn btn-info btn-xs" onClick={this.handleOnEdit}>
                                <span className="glyphicon glyphicon-pencil" />
                            </button>
                            <button ref="delete" type="button" className="btn btn-info btn-xs" onClick={this.handleOnDelete}>
                                <span className="glyphicon glyphicon-trash" />
                            </button>
                        </div>
                    );
                }
            }
        }
    },
    render: function() {
        return (
            <div className="BoardToolbar">
                {this.getTitle()}
                {this.getButtons()}
            </div>
        );
    }
});

var UserInfoForm = React.createClass({
    handleOnKeyDown: function(e) {
        if (e.keyCode === 13) {
            var email = ReactDOM.findDOMNode(this.refs.email);
            var password = ReactDOM.findDOMNode(this.refs.password);
            if (e.target === email) {
                password.focus();
            } else if (e.target === password) {
                this.submit();
            }
        }
    },
    handleOnClick: function() {
        this.submit();
    },
    submit: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return;
        }
        var email = ReactDOM.findDOMNode(this.refs.email).value;
        var password = ReactDOM.findDOMNode(this.refs.password).value;
        this.props.onClick(email, password);
    },
    getError: function() {
        console.log(this.props.error);
        if (this.props.error) {
            return (
                <Alert style="warning" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-info btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-info btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
        );
    },
	render: function() {
		return (
			<div className="UserInfoModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <div className="form center-block">
                            {this.getError()}
                            <div className="form-group">
                                <Input ref="email" placeholder="Email" size="input-md" onKeyDown={this.handleOnKeyDown}></Input>
                            </div>
                            <div className="form-group">
                                <Input ref="password" placeholder="Password" type="password" size="input-md" onKeyDown={this.handleOnKeyDown}></Input>
                            </div>
                            <div className="UserInfoFormButton">
                                <div className="form-group">
                                    {this.getButton()}
                                </div>
                            </div>
                        </div>
                    </div>
				</div>
			</div>
		);
	}
});

var Login = React.createClass({
	render: function() {
		return (
            <UserInfoForm title="Log In" workInfo={this.props.workInfo} button="Log In" error={this.props.error} onClick={this.props.onLogin} onAlertDismiss={this.props.onAlertDismiss} />
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
            <UserInfoForm title="Sign up" workInfo={this.props.workInfo} button="Sign up" error={this.props.error} onClick={this.props.onSignup} onAlertDismiss={this.props.onAlertDismiss} />
		);
	}
});

var BoardForm = React.createClass({
    handleOnKeyDown: function(e) {
        if (e.keyCode === 13) {
            var title = ReactDOM.findDOMNode(this.refs.title);
            if (e.target === title) {
                this.submit();
            }
        }
    },
    handleOnClick: function() {
        this.submit();
    },
    submit: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return;
        }
        var title = ReactDOM.findDOMNode(this.refs.title).value;
        if (this.props.board && this.props.board.title === title) {
            this.props.onClick(null);
            return;
        }
        this.props.onClick(title);
    },
    getError: function() {
        if (this.props.error) {
            return (
                <Alert style="warning" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-info btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-info btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
        );
    },
    render: function() {
        var board = {};
        if (this.props.board) {
            board = this.props.board;
        }
        return (
			<div className="UserInfoModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title"><div className="Overflow">{this.props.title}</div></h3>
                    </div>
                    <div className="panel-body">
                        <div className="form center-block">
                            {this.getError()}
                            <div className="form-group">
                                <Input ref="title" placeholder="Board Title" size="input-md" onKeyDown={this.handleOnKeyDown}>{board.title}</Input>
                            </div>
                            <div className="UserInfoFormButton">
                                <div className="form-group">
                                    {this.getButton()}
                                </div>
                            </div>
                        </div>
                    </div>
				</div>
			</div>
        );
    }
});

var Create = React.createClass({
    render: function() {
        return (
            <BoardForm title="Create" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var Edit = React.createClass({
    render: function() {
        return (
            <BoardForm board={this.props.board} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var APIs = {
    login: "login.json",
    signup: "signup.json",
    boards: "get_boards.json",
    delete: "delete_board.json",
    create: "create_board.json",
    edit: "edit_board.json",
    logout: "logout"
};

ReactDOM.render(
    <Index APIs={APIs} />,
    document.getElementById("body")
);
