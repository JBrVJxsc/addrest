var React = require('react');
var ReactDOM = require('react-dom');
var Boron = require('boron');
var Navbar = require('./common').Navbar;

var Index = React.createClass({
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
				<Modal ref="login" type="WaveModal" content={<Login />}/>
				<Modal ref="signup" type="WaveModal" content={<Signup />}/>
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <IndexBackground />
			</div>
		);
	}
});

var IndexBackground = React.createClass({
    render: function () {
        return (
            <div>
                <img src="/addrest/static/images/background-index.jpg" className="img-responsive" alt="Responsive image" />
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
	render: function () {
		return (
			<form className="form col-md-12 center-block">
				<div className="form-group">
					<input type="text" spellCheck="false" className="form-control" placeholder="Email" />
				</div>
				<div className="form-group">
					<input type="password" className="form-control" placeholder="Password" />
				</div>
				<div className="form-group">
					<button className="btn btn-warning btn-block">{this.props.button}</button>
				</div>
			</form>
		);
	}
});

var Login = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Log In">
                <UserInfoForm button="Log In" />
			</UserInfoModal>
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
			<UserInfoModal title="Sign up">
                <UserInfoForm button="Sign up" />
			</UserInfoModal>
		);
	}
});

var Modal = React.createClass({
	toggle: function() {
		this.refs.dialog.toggle();
	},
	render: function() {
		var Dialog = Boron[this.props.type];
		return (
			<Dialog ref="dialog">{this.props.content}</Dialog>
		)
	}
});

ReactDOM.render(
    <Index />,
    document.body
);