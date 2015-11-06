var React = require('react');
var ReactDOM = require('react-dom');
var Boron = require('boron');
var Alert = require('react-bootstrap').Alert;

var Navbar = React.createClass({
    getInitialState: function() {
        return {
            user: null,
            error: {},
            work_info: {},
            APIs: {
                login: "login",
                signup: "signup",
                logout: "logout",
                get_user: "get_user"
            }
        };
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
                this.getUser();
            }
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.state.APIs.login,
                data: data,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 800);
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
                url: this.state.APIs.signup,
                data: data,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 800);
    },
    logout: function() {
        this.work("logout", true, "Goodbye...");

        var callback = function() {
            this.stopWork();
            this.getUser();
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.state.APIs.logout,
                success: callback
            });
        }.bind(this);

        setTimeout(delay, 800);
    },
    getUser: function() {
        $.ajax({
            type: 'POST',
            url: this.state.APIs.get_user,
            success: function(data) {
                if (!data.result) {
                    return;
                }

                if (data.result.user === null) {
                    if (this.props.nullUserAction) {
                        this.props.nullUserAction();
                    }
                    return;
                }
                // We only set user's state when user is null.
                if (this.state.user === null) {
                    if (this.props.onUserLoggedIn) {
                        this.props.onUserLoggedIn(data.result.user);
                    }
                    this.setState({
                        user: data.result.user
                    });
                }
                // If user changes, then we refresh page.
                if (data.result.user.id !== this.state.user.id) {
                    location.reload();
                }
            }.bind(this)
        });
    },
    getDefaultButton: function() {
        if (this.state.user) {
            return [{
                onClick: function() {
                    this.logout();
                }.bind(this),
                text: "Log out",
                worker: true
            }];
        } else {
            return [
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
            ];
        }
    },
    getButtons: function(buttons) {
        var buttonList = [];
        for (var i in buttons) {
            var button = buttons[i];
            var navbarButton;
            if (button.worker) {
                navbarButton = <NavbarButton key={button.text} workInfo={this.state.work_info.logout} onClick={button.onClick}>{button.text}</NavbarButton>;
            } else {
                navbarButton = <NavbarButton key={button.text} onClick={button.onClick}>{button.text}</NavbarButton>
            }
            buttonList.push(navbarButton);
        }
        return buttonList;
    },
    componentDidMount: function() {
        this.getUser();
        setInterval(this.getUser, 5000);
    },
	render: function() {
        var defaultButtons = this.getDefaultButton();
		return (
			<div>
				<Modal ref="login" type="WaveModal">
                    <Login workInfo={this.state.work_info.login} error={this.state.error.login} onLogin={this.handleOnLogin} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup workInfo={this.state.work_info.signup} error={this.state.error.signup} onSignup={this.handleOnSignup} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <div className="navbar-brand">{this.props.title}</div>
                        </div>
                        <div className="collapse navbar-collapse">
                            <div className="navbar-form navbar-left">
                                {this.state.user ? this.getButtons(this.props.buttons) : null}
                            </div>
                            <div className="navbar-form navbar-right">
                                {this.getButtons(defaultButtons)}
                            </div>
                        </div>
                    </div>
                </nav>
			</div>
		);
	}
});

var NavbarButton = React.createClass({
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button type="button" className="animated bounceIn btn btn-warning disabled">{this.props.workInfo.message}</button>
            );
        }
        return (
            <button type="button" className="animated bounceIn btn btn-warning" onClick={this.props.onClick}>{this.props.children}</button>
        );
    },
    render: function() {
        return this.getButton();
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
        if (this.props.error) {
            return (
                <DismissibleAlert style="danger" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-warning btn-block disabled">{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-warning btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
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

var Modal = React.createClass({
	toggle: function() {
		this.refs.dialog.toggle();
	},
	show: function() {
		this.refs.dialog.show();
        var callback = function() {
            var inputs = $('#Modal-Content').find('input[type=text]');
            if (inputs.length > 0) {
                inputs[0].focus();
            } else {
                var buttons = $('#Modal-Content').find('button');
                if (buttons.length > 0) {
                    buttons[0].focus();
                }
            }
        };
        setTimeout(callback, 200);
	},
	hide: function() {
		this.refs.dialog.hide();
	},
	render: function() {
		var Dialog = Boron[this.props.type];
		return (
			<Dialog ref="dialog">
                <div id="Modal-Content">
                    {this.props.children}
                </div>
            </Dialog>
		)
	}
});

var Switch = React.createClass({
    handleOnClick: function(e) {
        if (e.target.innerText == "On") {
            this.props.onSwitch(true);
        } else if (e.target.innerText == "Off") {
            this.props.onSwitch(false);
        }
    },
    render: function() {
        var onClassName = "btn btn-warning btn-xs";
        var offClassName = "btn btn-warning btn-xs";
        if (this.props.state) {
            onClassName += " active";
        } else {
            offClassName += " active";
        }
        return (
            <div className="btn-group" data-toggle="buttons">
                <label className={onClassName} onClick={this.handleOnClick}>
                    <input type="radio" autoComplete="off" /> On
                </label>
                <label className={offClassName} onClick={this.handleOnClick}>
                    <input type="radio" autoComplete="off" /> Off
                </label>
            </div>
        );
    }
});

var Input = React.createClass({
    handleOnChange: function(e) {
        if (this.props.onChange) {
            this.props.onChange(e.target.value);
        }
    },
    componentDidMount: function() {
        if (this.props.children) {
            this.refs.input.value = this.props.children;
        }
    },
    render: function() {
        var className = "form-control";
        if (this.props.size) {
            className += " " + this.props.size;
        } else {
            className += " input-sm";
        }
        var type = "text";
        if (this.props.type) {
            type = this.props.type;
        }
        return (
          <input ref="input" type={type} spellCheck="false" autoComplete="false" className={className} placeholder={this.props.placeholder} onChange={this.handleOnChange} onKeyDown={this.props.onKeyDown} />
        );
    }
});

var DismissibleAlert = React.createClass({
    getTitle: function() {
        if (this.props.title) {
            return (
                <h4>{this.props.title}</h4>
            );
        }
    },
    render: function() {
        return (
            <div key={this.props.message} className="animated shake">
                <Alert bsStyle={this.props.style} onDismiss={this.props.onDismiss}>
                    {this.getTitle()}
                    <p>{this.props.message}</p>
                </Alert>
            </div>
        );
    }
});

var ConfirmWindow = React.createClass({
    handleOnClick: function(e) {
        var yes = ReactDOM.findDOMNode(this.refs.yes);
        var no = ReactDOM.findDOMNode(this.refs.no);
        if (e.target === yes) {
            this.props.onConfirm(true);
        } else if (e.target === no) {
            this.props.onConfirm(false);
        }
    },
    getError: function() {
        if (this.props.error) {
            return (
                <DismissibleAlert style="danger" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button ref="yes" className="btn btn-warning btn-block disabled">{this.props.workInfo.message}</button>
            );
        }
        return (
            <button ref="yes" className="btn btn-warning btn-block" onClick={this.handleOnClick}>Yes</button>
        );
    },
    render: function() {
        return (
            <div className="ConfirmWindow">
                <div className="panel panel-warning">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <div className="form center-block">
                            {this.getError()}
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <button ref="no" className="btn btn-block" onClick={this.handleOnClick}>No</button>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        {this.getButton()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var PostViewer = React.createClass({
    render: function() {
        return (
            <div></div>
        );
    }
});

var Utils = {
    validateEmail: function(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }
};

module.exports = {
    Utils: Utils,
    Navbar: Navbar,
    Modal: Modal,
    Input: Input,
    Switch: Switch,
    Alert: DismissibleAlert,
    ConfirmWindow: ConfirmWindow
};
