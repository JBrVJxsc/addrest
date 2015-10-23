var React = require('react');
var ReactDOM = require('react-dom');
var Utils = require('./common').Utils;
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Alert = require('./common').Alert;

var Index = React.createClass({
    getInitialState: function() {
        return {
            user: null,
            boards: [],
            errors: {},
            work_info: {}
        };
    },
    handleOnAlertDismiss: function() {
        this.clearErrors();
    },
    handleOnLogin: function(email, password) {
        // Clear old errors first.
        this.clearErrors();

        console.log("handleOnLogin");

        // Check email.
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
        // Clear old errors first.
        this.clearErrors();

        // Check email.
        if (!Utils.validateEmail(email)) {
            this.setErrors({
                signup: {
                    message: "Please enter a valid email address."
                }
            });
            return;
        }

        // Check password.
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
            console.log(data);
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

        setTimeout(delay, 1000);
    },
    signup: function(email, password) {
        this.work(true, "Signing...");

        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            console.log(data);
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

        setTimeout(delay, 1000);
    },
    logout: function() {
        
    },
    getBoards: function() {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.boards,
            success: function(data) {
                console.log("user");
                console.log(data);
                if (this.isMounted()) {
                    console.log("got boards and is mounted");
                    console.log(data.result.boards);
                    console.log(data.result.user);
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
        console.log("Alert is clearing.");
        this.setState({
            errors: {}
        });
    },
    getButtons: function() {
        console.log("getButtons...");
        console.log(this.state.user);
        if (this.state.user) {
            return {
                left: [
                    {
                        onClick: function () {
                            this.clearErrors();
                            this.refs.create.show();
                        }.bind(this),
                        text: "Create"
                    }
                ],
                right: [
                    {
                        onClick: function () {
                            window.location.href = this.props.APIs.logout;
                        }.bind(this),
                        text: "Log out"
                    }
                ]
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
				<Navbar user={this.state.user} defaultTitle="Boards" ref="navbar" buttons={this.getButtons()} />
                <BoardListPanel boards={this.state.boards} />
			</div>
		);
	}
});

var BoardListPanel = React.createClass({
    render: function() {
        return (
            <div className="BoardListPanel">
                <br />
                <br />
                <br />
                <br />
            </div>
        );
    }
});

var BoardList = React.createClass({
    render: function() {
        return (
            <div>

            </div>
        );
    }
});

var Board = React.createClass({
    render: function() {
        return (
            <div>

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
                <button className="btn btn-success btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-success btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
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
    logout: "logout"
};

ReactDOM.render(
    <Index APIs={APIs} />,
    document.getElementById("body")
);
