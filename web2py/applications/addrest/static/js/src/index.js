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
            errors: {},
            work_info: {},
            deleting: null
        };
    },
    getBoardEventHandlers: function() {
        return {
            handleOnEdit: function(e) {
                console.log("editing");
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
        this.clearErrors();
    },
    handleOnLogin: function(email, password) {
        this.clearErrors();

        if (!Utils.validateEmail(email)) {
            this.setErrors({
                login: {
                    message: "Please enter a valid email address."
                }
            });
            return;
        }

        this.login(email, password);
    },
    handleOnSignup: function(email, password) {
        this.clearErrors();

        if (!Utils.validateEmail(email)) {
            this.setErrors({
                signup: {
                    message: "Please enter a valid email address."
                }
            });
            return;
        }

        if (password.length < 4) {
            this.setErrors({
                signup: {
                    message: "Password is too short."
                }
            });
            return;
        }

        this.signup(email, password);
    },
    work: function(working, message) {
        this.setState({
            work_info: {
                working: working,
                message: message
            }
        });
    },
    login: function(email, password) {
        this.work(true, "Logging...");

        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            this.work(false, "");
            if (data.result === false) {
                this.setErrors({
                    login: {
                        message: "Email and password do not match."
                    }
                });
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
        this.work(true, "Signing...");

        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            this.work(false, "");
            if (data.result === false) {
                this.setErrors({
                    signup: {
                        message: "Email address has been used."
                    }
                });
            } else {
                this.login(email, password);
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
        var callback = function(data) {
            this.getBoards();
        }.bind(this);

        $.ajax({
            type: 'POST',
            url: this.props.APIs.logout,
            success: callback
        });
    },
    create: function(board) {

    },
    delete: function(board) {
        this.work(true, "Deleting...");

        var callback = function(data) {
            console.log(data);
            this.refs.delete.hide();
            this.work(false, "");
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
    setErrors: function(errors) {
        this.setState({
            errors: errors
        });
    },
    clearErrors: function() {
        this.setState({
            errors: {}
        });
    },
    getButtons: function() {
        if (this.state.user) {
            return {
                left: [{
                        onClick: function () {
                            this.clearErrors();
                            this.refs.create.show();
                        }.bind(this),
                        text: "Create"
                    }],
                right: [{
                        onClick: function () {
                            this.logout();
                        }.bind(this),
                        text: "Log out"
                    }]
            }
        } else {
            return {
                left: null,
                right: [
                    {
                        onClick: function () {
                            this.clearErrors();
                            this.refs.signup.show();
                        }.bind(this),
                        text: "Sign up"
                    },
                    {
                        onClick: function () {
                            this.clearErrors();
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
                    <Login workInfo={this.state.work_info} error={this.state.errors.login} onLogin={this.handleOnLogin} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup workInfo={this.state.work_info} error={this.state.errors.signup} onSignup={this.handleOnSignup} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="create" type="WaveModal">
                    Create Board!
                </Modal>
				<Modal ref="delete" type="WaveModal">
                    <ConfirmWindow workInfo={this.state.work_info} title="Are you sure?" onConfirm={this.handleOnDelete} />
                </Modal>
				<Navbar user={this.state.user} defaultTitle="Boards" ref="navbar" buttons={this.getButtons()} />
                <BoardListPanel user={this.state.user} boards={this.state.boards} onBoardEvents={this.getBoardEventHandlers()} />
			</div>
		);
	}
});

var BoardListPanel = React.createClass({
    render: function() {
        return (
            <div>
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
                    <div className="col-xs-3">
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
                    <div key={i} className="col-xs-3">
                        <Board user={this.props.user} board={boards[i]} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                );
            }
        }
        return rows;
    },
    render: function() {
        return (
            <div className="container">
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
                {this.props.board.title}
                {this.getButtons()}
            </div>
        );
    }
});

var UserInfoModal = React.createClass({
	render: function() {
		return (
			<div className="UserInfoModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">{this.props.children}</div>
				</div>
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
        if (this.props.workInfo.working) {
            return;
        }
        this.submit();
    },
    submit: function() {
        var email = ReactDOM.findDOMNode(this.refs.email).value;
        var password = ReactDOM.findDOMNode(this.refs.password).value;
        this.props.onClick(email, password);
    },
    getError: function() {
        if (this.props.error) {
            return (
                <Alert style="info" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getButton: function() {
        if (this.props.workInfo.working) {
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
			<div className="form center-block">
                {this.getError()}
				<div className="form-group">
					<Input ref="email" placeholder="Email" size="input-md" onKeyDown={this.handleOnKeyDown}></Input>
				</div>
				<div className="form-group">
                    <Input ref="password" placeholder="Password" type="password" size="input-md" onKeyDown={this.handleOnKeyDown}></Input>
				</div>
				<div className="form-group">
                    {this.getButton()}
				</div>
			</div>
		);
	}
});

var Login = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Log In">
                <UserInfoForm workInfo={this.props.workInfo} button="Log In" error={this.props.error} onClick={this.props.onLogin} onAlertDismiss={this.props.onAlertDismiss} />
			</UserInfoModal>
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Sign up">
                <UserInfoForm workInfo={this.props.workInfo} button="Sign up" error={this.props.error} onClick={this.props.onSignup} onAlertDismiss={this.props.onAlertDismiss} />
			</UserInfoModal>
		);
	}
});

var APIs = {
    login: "login.json",
    signup: "signup.json",
    boards: "boards.json",
    delete: "delete.json",
    logout: "logout"
};

ReactDOM.render(
    <Index APIs={APIs} />,
    document.getElementById("body")
);
