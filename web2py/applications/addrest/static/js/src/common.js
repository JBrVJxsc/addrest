var React = require('react');
var Boron = require('boron');
var Alert = require('react-bootstrap').Alert;

var Navbar = React.createClass({
    getButtons: function(buttons) {
        var buttonList = [];
        for (var i in buttons) {
            var button = buttons[i];
            buttonList.push(<NavbarButton key={i} onClick={button.onClick}>{button.text}</NavbarButton>);
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
    render: function() {
        return (
            <button type="button" className="btn btn-warning" onClick={this.props.onClick}>{this.props.children}</button>
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
          <input ref="input" type={type} spellCheck="false" autoComplete="false" className={className} placeholder={this.props.placeholder} onChange={this.handleOnChange} />
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
            <Alert bsStyle="danger" onDismiss={this.props.onDismiss}>
                {this.getTitle()}
                <p>{this.props.message}</p>
            </Alert>
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
    Alert: DismissibleAlert
};
