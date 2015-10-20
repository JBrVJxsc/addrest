var React = require('react');
var ReactDOM = require('react-dom');
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Switch = require('./common').Switch;

var Dashboard = React.createClass({
    getInitialState: function () {
        return {
            addresses: [
                {
                    show: true,
                    id: 0,
                    first_name: "Xu 1",
                    last_name: "ZHANG",
                    company: "Zenefits",
                    area: "831",
                    phone: "2950944",
                    street: "708 Koshland Way",
                    apt: "P",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95060"
                },
                {
                    show: true,
                    id: 1,
                    first_name: "Xu 2",
                    last_name: "ZHANG",
                    company: "Zenefits",
                    area: "831",
                    phone: "2950944",
                    street: "708 Koshland Way",
                    apt: "P",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95060"
                },
                {
                    show: true,
                    id: 2,
                    first_name: "Xu 3",
                    last_name: "ZHANG",
                    company: "Zenefits",
                    area: "831",
                    phone: "2950944",
                    street: "708 Koshland Way",
                    apt: "P",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95060"
                }
            ],
            editing: null
        };
    },
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
    getEventHandlers: function() {
        return {
            handleSearch: function(e) {
                console.log(e);
            }.bind(this),
            handleEdit: function(e) {
                this.setState({
                    editing: e
                });
                this.refs.edit.toggle();
                console.log(e);
            }.bind(this)
        };
    },
    render: function () {
        return (
			<div>
				<Modal ref="create" type="WaveModal" content={<Create />} />
                <Modal ref="edit" type="WaveModal" content={<Edit address={this.state.editing} />} />
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <AddressListPanel addresses={this.state.addresses} eventHandlers={this.getEventHandlers()} />
			</div>
        );
    }
});

var AddressListPanel = React.createClass({
    render: function () {
        return (
            <div>
                <div className="AddressListPanel box-shadow--3dp">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <AddressListToolbar onSearch={this.props.eventHandlers.handleSearch} />
                        </div>
                        <div className="panel-body">
                            <AddressList addresses={this.props.addresses} onEdit={this.props.eventHandlers.handleEdit} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var AddressListToolbar = React.createClass({
    handleOnChange: function (e) {
        this.props.onSearch({
            keyword: e
        });
    },
    render: function () {
        return (
            <div>
                <SearchTextBox onChange={this.handleOnChange}/>
            </div>
        );
    }
});

var SearchTextBox = React.createClass({
    render: function () {
        return (
            <div className="inner-addon left-addon">
                <i className="glyphicon glyphicon-search"></i>
                <Input placeholder="Search Addresses" onChange={this.props.onChange}></Input>
            </div>
        );
    }
});

var AddressList = React.createClass({
    getAddresses: function () {
        var rows = [];
        var addresses = this.props.addresses;
        for (var i in addresses) {
            if (addresses[i].show) {
                rows.push(<Address key={i} address={addresses[i]} onEdit={this.props.onEdit} />);
            }
        }
        return rows;
    },
    render: function () {
        return (
            <div>
                {this.getAddresses()}
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
                        <AddressToolbar address={this.props.address} onEdit={this.props.onEdit} />
                    </div>
                    <div className="panel-body">
                        {this.props.address.toString()}
                    </div>
				</div>
            </div>
        );
    }
});

var AddressToolbar = React.createClass({
    handleOnClick: function () {
        this.props.onEdit(this.props.address);
    },
    handleOnSwitch: function () {

    },
    render: function () {
        return (
            <div>
                <button type="button" className="btn btn-warning btn-xs" onClick={this.handleOnClick}>Edit</button>
                <div className="pull-right">
                    <Switch address={this.props.address} state={true} onSwitch={this.handleOnSwitch} />
                </div>
            </div>
        );
    }
});

var AddressEditModal = React.createClass({
    getButtons: function () {
        if (this.props.delete) {
            return (
                <div className="row">
                    <div className="col-xs-6 RightExtend">
                        <button className="btn btn-danger btn-block">Delete</button>
                    </div>
                    <div className="col-xs-6 LeftExtend">
                        <button className="btn btn-warning btn-block">Save</button>
                    </div>
                </div>
            );
        } else {
            return (
                <button className="btn btn-warning btn-block">Save</button>
            );
        }
    },
	render: function() {
        var address = {};
        if (this.props.address) {
            address = this.props.address;
        }
		return (
			<div className="AddressEditModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <div>
                            <h3 className="panel-title">{this.props.title}</h3>
                        </div>
                    </div>
                    <div className="panel-body">
                        <form className="form center-block">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input placeholder="First Name">{address.first_name}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input placeholder="Last Name">{address.last_name}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Company Name (optional)">{address.company}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input placeholder="Area Code">{address.area}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input placeholder="Primary Phone">{address.phone}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Street Address">{address.street}</Input>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Apt, Suite, Bldg. (optional)">{address.apt}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-4 RightExtend">
                                        <Input placeholder="City">{address.city}</Input>
                                    </div>
                                    <div className="col-xs-4 Extend">
                                        <Input placeholder="State">{address.state}</Input>
                                    </div>
                                    <div className="col-xs-4 LeftExtend">
                                        <Input placeholder="ZIP Code">{address.zip}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                {this.getButtons()}
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
            <AddressEditModal title="Edit" address={this.props.address} delete={true} />
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.getElementById("body")
);
