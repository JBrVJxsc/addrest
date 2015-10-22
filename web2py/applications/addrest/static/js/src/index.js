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
            errors: {}
        };
    },
    handleOnLogin: function(email, password) {
        // Check email.
        if (!Utils.validateEmail(email)) {
            this.setErrors({
                signup: {
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
    handleOnAlertDismiss: function() {
        this.clearErrors();
    },
    login: function(email, password) {
        
    },
    signup: function(email, password) {
        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            if (data.result === false) {
                this.setErrors({
                    signup: {
                        message: "Email address has been used."
                    }
                });
            } else {
                this.setState({
                    boards: data
                });
            }
        }.bind(this);

        $.ajax({
            type: 'POST',
            url: this.props.APIs.signup,
            data: data,
            success: callback
        });
    },
    logout: function() {
        
    },
    getBoards: function() {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.boards,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        boards: data
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
        return {
            left: null,
            right: [
                {
                    onClick: function() {
                        this.clearErrors();
                        this.refs.signup.toggle();
                    }.bind(this),
                    text: "Sign up"
                },
                {
                    onClick: function() {
                        this.refs.login.toggle();
                    }.bind(this),
                    text: "Log In"
                }
            ]
        };
    },
	componentDidMount: function() {
        this.getBoards();
	},
	render: function() {
		return (
			<div>
				<Modal ref="login" type="WaveModal">
                    <Login error={this.state.errors.login} onLogin={this.handleOnLogin} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup error={this.state.errors.signup} onSignup={this.handleOnSignup} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Navbar ref="navbar" buttons={this.getButtons()} />
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
    getError: function() {
        if (this.props.error) {
            return (
                <Alert bsStyle="danger" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    handleOnClick: function() {
        var email = ReactDOM.findDOMNode(this.refs.email).value;
        var password = ReactDOM.findDOMNode(this.refs.password).value;
        this.props.onClick(email, password);
    },
	render: function() {
		return (
			<div className="form center-block">
                {this.getError()}
				<div className="form-group">
					<Input ref="email" placeholder="Email" size="input-md"></Input>
				</div>
				<div className="form-group">
                    <Input ref="password" placeholder="Password" type="password" size="input-md"></Input>
				</div>
				<div className="form-group">
					<button className="btn btn-warning btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
				</div>
			</div>
		);
	}
});

var Login = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Log In">
                <UserInfoForm button="Log In" error={this.props.error} onClick={this.props.onLogin} onAlertDismiss={this.props.onAlertDismiss} />
			</UserInfoModal>
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Sign up">
                <UserInfoForm button="Sign up" error={this.props.error} onClick={this.props.onSignup} onAlertDismiss={this.props.onAlertDismiss} />
			</UserInfoModal>
		);
	}
});

var APIs = {
    login: "login.json",
    signup: "signup.json",
    boards: "boards.json"
};

ReactDOM.render(
    <Index APIs={APIs} />,
    document.getElementById("body")
);
