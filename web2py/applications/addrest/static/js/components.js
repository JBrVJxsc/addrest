/**
 * Created by xuzhang on 10/8/15.
 */

var Index = React.createClass({
    getButtons: function () {
        return [
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
        ];
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

var Navbar = React.createClass({
    getButtons: function () {
        var buttonList = [];
        var buttons = this.props.buttons;
        for (var i in buttons) {
            var button = buttons[i];
            buttonList.push(<NavbarButton onClick={button.onClick}>{button.text}</NavbarButton>);
        }
        return buttonList;
    },
	render: function() {
		return (
			<div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <div className="navbar-brand">Addrest</div>
                        </div>
                        <div className="collapse navbar-collapse">
                            <div className="navbar-form navbar-right">
                                {this.getButtons()}
                            </div>
                        </div>
                    </div>
                </nav>
			</div>
		);
	}
});

var NavbarButton = React.createClass({
    render: function () {
        return (
            <button type="button" className="btn btn-warning" onClick={this.props.onClick}>{this.props.children}</button>
        );
    }
});

var IndexBackground = React.createClass({
    render: function () {
        return (
            <div className="IndexBackground">
                <img src="/addrest/static/images/background-index.jpg" className="img-responsive" alt="Responsive image" />
            </div>
        );
    }
});

var ModalPanel = React.createClass({
	render: function() {
		return (
			<div className="ModalPanel">
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
			<ModalPanel title="Log In">
                <UserInfoForm button="Log In" />
			</ModalPanel>
		);
	}
});

var Signup = React.createClass({
	render: function() {
		return (
			<ModalPanel title="Sign up">
                <UserInfoForm button="Sign up" />
			</ModalPanel>
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

var Dashboard = React.createClass({
    getButtons: function () {
        return [
            {
                onClick: function () {

                }.bind(this),
                text: "What?"
            },
            {
                onClick: function () {
                    console.log("You've logged out.");
                }.bind(this),
                text: "Log Out"
            }
        ];
    },
    render: function () {
        return (
			<div>
				<Navbar ref="navbar" buttons={this.getButtons()} />
			</div>
        );
    }
});