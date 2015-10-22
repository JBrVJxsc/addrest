var React = require('react');
var ReactDOM = require('react-dom');
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;

var Index = React.createClass({
    handleOnLogin: function (email, password) {
        console.log(email + ", " + password);
    },
    handleOnSignup: function (email, password) {
        console.log(email + ", " + password);
    },
    login: function (email, password) {
        
    },
    signup: function (email, password) {

    },
    logout: function () {
        
    },
    getButtons: function () {
        return {
            left: null,
            right: [
                {
                    onClick: function () {
                        this.refs.signup.toggle();
                    }.bind(this),
                    text: "Sign up"
                },
                {
                    onClick: function () {
                        this.refs.login.toggle();
                    }.bind(this),
                    text: "Log In"
                }
            ]
        };
    },
	componentDidMount: function() {

	},
	render: function() {
		return (
			<div>
				<Modal ref="login" type="WaveModal" content={<Login onLogin={this.handleOnLogin} />}/>
				<Modal ref="signup" type="WaveModal" content={<Signup onSignup={this.handleOnSignup} />}/>
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <BoardListPanel url="boards.json" />
			</div>
		);
	}
});

var BoardListPanel = React.createClass({
    getInitialState: function () {
        return {
            boards: {
                is_logged_in: true
            }
        };
    },
    getBoards: function () {
        
    },
    componentDidMount: function () {
        $.ajax({
            type: 'POST',
            url: this.props.url,
            success: function(data) {
                if (this.isMounted()) {
                    console.log('Ajax done.');
                    console.log(data);
                    this.setState({
                        boards: data
                    });
                }
            }.bind(this)
        });
    },
    render: function () {
        return (
            <div className="BoardListPanel">
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <div>{this.state.boards.is_logged_in.toString()}</div>
                haha
                <br />
            </div>
        );
    }
});

var BoardList = React.createClass({
    render: function () {
        return (
            <div>

            </div>
        );
    }
});

var Board = React.createClass({
    render: function () {
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
    handleOnClick: function () {
        var email = ReactDOM.findDOMNode(this.refs.email).value;
        var password = ReactDOM.findDOMNode(this.refs.password).value;
        this.props.onClick(email, password);
    },
	render: function () {
		return (
			<div className="form center-block">
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

ReactDOM.render(
    <Index />,
    document.getElementById("body")
);
