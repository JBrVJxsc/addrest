var React = require('react');
var ReactDOM = require('react-dom');
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;

var Dashboard = React.createClass({
    getButtons: function () {
        return {
            left: [
                {
                    onClick: function () {
                        this.refs.create.toggle();
                    }.bind(this),
                    text: "Create"
                }
            ],
            right: [
                {
                    onClick: function () {
                        console.log("Logging out.");
                    }.bind(this),
                    text: "Log out"
                }
            ]
        };
    },
    render: function () {
        return (
			<div>
				<Modal ref="create" type="WaveModal" content={<Create />}/>
				<Modal ref="edit" type="WaveModal" content={<Edit />}/>
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
    handleOnClick: function () {
        
    },
    render: function () {
        return (
            <div>
                <button type="button" className="btn btn-warning btn-xs">Edit</button>
                <div className="pull-right">
                    <Switch state={true}/>
                </div>
            </div>
        );
    }
});

var Switch = React.createClass({
    handleOnClick: function(e) {
        if (e.target.innerText == "On") {
            console.log("On");
            if (!this.props.state) {
                this.props.onClick(true);
            }
        } else if (e.target.innerText == "Off") {
            console.log("Off");
            if (!this.props.state) {
                this.props.onClick(false);
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

var AddressEditModal = React.createClass({
	render: function() {
		return (
			<div className="AddressEditModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <form className="form center-block">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input>First Name</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input>Last Name</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input>Company Name (optional)</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input>Area Code</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input>Primary Phone</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input>Street Address</Input>
                            </div>
                            <div className="form-group">
                                <Input>Apt, Suite, Bldg. (optional)</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-4 RightExtend">
                                        <Input>City</Input>
                                    </div>
                                    <div className="col-xs-4 Extend">
                                        <Input>State</Input>
                                    </div>
                                    <div className="col-xs-4 LeftExtend">
                                        <Input>ZIP Code</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6">
                                        <button className="btn btn-warning btn-block">Cancel</button>
                                    </div>
                                    <div className="col-xs-6">
                                        <button className="btn btn-warning btn-block">Save</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
				</div>
			</div>
		);
	}
});

var Create = React.createClass({
    render: function () {
        return (
            <AddressEditModal title="Create" />
        );
    }
});

var Edit = React.createClass({
    render: function () {
        return (
            <AddressEditModal title="Edit" />
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.getElementById('body')
);
