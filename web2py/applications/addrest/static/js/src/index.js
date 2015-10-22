var React = require('react');
var ReactDOM = require('react-dom');
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
        console.log(email + ", " + password);
    },
    handleOnSignup: function(email, password) {
        console.log(email + ", " + password);
        this.signup(email, password);
    },
    login: function(email, password) {
        
    },
    signup: function(email, password) {
        var data = {
            email: email,
            password: password
        };

        var callback = function(data) {
            console.log(data);
            this.setState({
                boards: data
            });
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
    getButtons: function() {
        return {
            left: null,
            right: [
                {
                    onClick: function() {
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
	render: function() {
		return (
			<div>
				<Modal ref="login" type="WaveModal">
                    <Login error={this.state.errors.login} onLogin={this.handleOnLogin} />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup error={this.state.errors.signup} onSignup={this.handleOnSignup} />
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
    handleOnClick: function() {
        var email = ReactDOM.findDOMNode(this.refs.email).value;
        var password = ReactDOM.findDOMNode(this.refs.password).value;
        this.props.onClick(email, password);
    },
	render: function() {
		return (
			<div className="form center-block">
                <Alert bsStyle="danger" onDismiss={true}>
                    <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
                </Alert>
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
                <UserInfoForm button="Log In" onClick={this.props.onLogin} />
			</UserInfoModal>
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Sign up">
                <UserInfoForm button="Sign up" onClick={this.props.onSignup} />
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
