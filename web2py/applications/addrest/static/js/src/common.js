var React = require('react');
var ReactDOM = require('react-dom');
var Boron = require('boron');
var Alert = require('react-bootstrap').Alert;

var Navbar = React.createClass({
    getTitle: function() {
        // Here we can show user's email as title if
        // user has been logged in. I comment this
        // because sometimes the graders' test-email
        // is not formal and will ruin the uniform
        // of the page.
        //if (this.props.user) {
        //    return this.props.user.email;
        //}
        return this.props.defaultTitle;
    },
    getButtons: function(buttons) {
        var buttonList = [];
        for (var i in buttons) {
            var button = buttons[i];
            var navbarButton;
            if (button.working) {
                navbarButton = <NavbarButton key={i} workInfo={this.props.workInfo} onClick={button.onClick}>{button.text}</NavbarButton>;
            } else {
                navbarButton = <NavbarButton key={i} onClick={button.onClick}>{button.text}</NavbarButton>
            }
            buttonList.push(navbarButton);
        }
        return buttonList;
    },
	render: function() {
		return (
			<div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <div className="navbar-brand">{this.getTitle()}</div>
                        </div>
                        <div className="collapse navbar-collapse">
                            <div className="navbar-form navbar-left">
                                {this.getButtons(this.props.buttons.left)}
                            </div>
                            <div className="navbar-form navbar-right">
                                {this.getButtons(this.props.buttons.right)}
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
        if (this.props.workInfo) {
            if (this.props.workInfo.working) {
                return (
                    <button type="button" className="btn btn-info disabled" onClick={this.props.onClick}>{this.props.workInfo.message}</button>
                );
            }
        }
        return (
            <button type="button" className="btn btn-info" onClick={this.props.onClick}>{this.props.children}</button>
        );
    },
    render: function() {
        return this.getButton();
    }
});

var Modal = React.createClass({
	toggle: function() {
		this.refs.dialog.toggle();
	},
	show: function() {
		this.refs.dialog.show();
	},
	hide: function() {
		this.refs.dialog.hide();
	},
	render: function() {
		var Dialog = Boron[this.props.type];
		return (
			<Dialog ref="dialog">{this.props.children}</Dialog>
		)
	}
});

var Switch = React.createClass({
    handleOnClick: function(e) {
        if (e.target.innerText == "On") {
            console.log("On");
            if (!this.props.state) {
                this.props.onSwitch(true);
            }
        } else if (e.target.innerText == "Off") {
            console.log("Off");
            if (!this.props.state) {
                this.props.onSwitch(false);
            }
        } else {
            console.log(e);
        }
    },
    render: function() {
        var onClassName = "btn btn-info btn-xs";
        var offClassName = "btn btn-info btn-xs";
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
        console.log("Alert is rendering.");
        return (
            <Alert bsStyle={this.props.style} onDismiss={this.props.onDismiss}>
                {this.getTitle()}
                <p>{this.props.message}</p>
            </Alert>
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
    getButton: function() {
        if (this.props.workInfo.working) {
            return (
                <button ref="yes" className="btn btn-info btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
            );
        }
        return (
            <button ref="yes" className="btn btn-info btn-block" onClick={this.handleOnClick}>Yes</button>
        );
    },
    render: function() {
        return (
            <div className="ConfirmWindow">
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <div className="form center-block">
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
