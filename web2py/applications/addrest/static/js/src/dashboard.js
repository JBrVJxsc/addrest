var React = require('react');
var ReactDOM = require('react-dom');
var Boron = require('boron');
var Switch = require('react-bootstrap-switch');
var Navbar = require('./common').Navbar;

var Dashboard = React.createClass({
    getButtons: function () {
        return {
            left: [
                {
                    onClick: function () {
                        this.refs.signup.toggle();
                    }.bind(this),
                    text: "Create"
                }
            ],
            right: [
                {
                    onClick: function () {
                        this.refs.login.toggle();
                    }.bind(this),
                    text: "Log out"
                }
            ]
        };
    },
    render: function () {
        return (
			<div>
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <AddressListPanel />
			</div>
        );
    }
});

var AddressListPanel = React.createClass({
    render: function () {
        return (
			<div className="AddressListPanel box-shadow--3dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <AddressListToolbar />
                    </div>
                    <div className="panel-body">
                        <AddressList />
                    </div>
				</div>
			</div>
        );
    }
});

var AddressListToolbar = React.createClass({
    render: function () {
        return (
            <div>
                <SearchTextBox />
            </div>
        );
    }
});

var SearchTextBox = React.createClass({
    render: function () {
        return (
            <div className="inner-addon left-addon">
                <i className="glyphicon glyphicon-search"></i>
                <input type="text" spellCheck="false" className="form-control input-sm" placeholder="Search Addresses" />
            </div>
        );
    }
});

var AddressList = React.createClass({
    render: function () {
        return (
            <div>
                <Address>Address 1</Address>
                <Address>Address 2</Address>
                <Address>Address 3</Address>
                <Address>Address 4</Address>
                <Address>Address 5</Address>
            </div>
        );
    }
});

var Address = React.createClass({
    render: function () {
        return (
            <div className="Address box-shadow--2dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <AddressToolbar />
                    </div>
                    <div className="panel-body">
                        {this.props.children}
                    </div>
				</div>
            </div>
        );
    }
});

var AddressToolbar = React.createClass({
    render: function () {
        return (
            <div>

            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.body
);
