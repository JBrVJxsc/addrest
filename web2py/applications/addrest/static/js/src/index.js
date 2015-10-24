var React = require('react');
var ReactDOM = require('react-dom');
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;

var Index = React.createClass({
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

	},
	render: function() {
		return (
			<div>
				<Modal ref="login" type="WaveModal">
                    <Login />
                </Modal>
				<Modal ref="signup" type="WaveModal">
                    <Signup />
                </Modal>
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <IndexBackground />
			</div>
		);
	}
});

var IndexBackground = React.createClass({
    render: function() {
        return (
            <div>
                <img src="/addrest/static/images/background-index.jpg" className="img-responsive" alt="Responsive image" />
            </div>
        );
    }
});

var UserInfoForm = React.createClass({
	render: function() {
		return (
			<div className="UserInfoModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <form className="form center-block">
                            <div className="form-group">
                                <Input placeholder="Email" size="input-md"></Input>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Password" type="password" size="input-md"></Input>
                            </div>
                            <div className="form-group">
                                <button className="btn btn-warning btn-block">{this.props.button}</button>
                            </div>
                        </form>
                    </div>
				</div>
			</div>
		);
	}
});

var Login = React.createClass({
	render: function() {
		return (
            <UserInfoForm title="Log In" button="Log In" />
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
            <UserInfoForm title="Sign up" button="Sign up" />
		);
	}
});

ReactDOM.render(
    <Index />,
    document.getElementById("body")
);
