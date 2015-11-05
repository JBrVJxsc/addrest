var React = require('react');
var ReactDOM = require('react-dom');
var Moment = require('moment');
var UUID = require('uuid');
var Utils = require('./common').Utils;
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Alert = require('./common').Alert;
var Switch = require('./common').Switch;
var ConfirmWindow = require('./common').ConfirmWindow;

var Index = React.createClass({
    getInitialState: function() {
        return {
            get_api_api: "/get_api",
            APIs: {}
        };
    },
    handleOnUserLoggedIn: function(user) {
        this.getAPIs();
    },
    handleNullUserAction: function() {
        window.location.replace("/");
    },
    getAPIs: function() {
        $.ajax({
            type: 'POST',
            url: this.state.get_api_api,
            success: function(data) {
                Object.keys(data).map(function(value, index) {
                    data[value] = window.location.origin + data[value];
                }.bind(this));
                this.setState({
                    APIs: data
                });
                this.refs.listPanel.getList();
            }.bind(this)
        });
    },
    getButtons: function() {
        return [{
            onClick: function () {
                this.refs.listPanel.create();
            }.bind(this),
            text: "Create"
        }]
    },
	render: function() {
		return (
			<div>
				<Navbar ref="navbar" title="Addrest" buttons={this.getButtons()} onUserLoggedIn={this.handleOnUserLoggedIn} nullUserAction={this.handleNullUserAction} />
                <ListPanel ref="listPanel" APIs={this.state.APIs} />
			</div>
		);
	}
});

var Editor = React.createClass({
    getInitialState: function() {
        return {
            error: {},
            work_info: {},
            editing: null,
            deleting: null
        };
    },
    handleOnAlertDismiss: function() {
        this.clearError();
    },
    handleOnCreate: function(entity) {
        this.clearError();

        if (this.checkEntity(entity, "create")) {
            this._create(entity);
        }
    },
    handleOnEdit: function(entity) {
        this.clearError();

        // Entity did not change.
        if (entity === null) {
            this.refs.edit.hide();
            return;
        }

        if (this.checkEntity(entity, "edit")) {
            this._edit(entity);
        }
    },
    handleOnDelete: function(e) {
        if (e) {
            this._delete(this.state.deleting);
        } else {
            this.refs.delete.hide();
            this.refs.edit.show();
        }
    },
    checkEntity: function(entity, worker) {
        if (entity.first_name.length === 0) {
            this.setError(worker, "Please enter a valid first name.");
        } else if (entity.last_name.length === 0) {
            this.setError(worker, "Please enter a valid last name.");
        } else if (entity.area.length === 0) {
            this.setError(worker, "Please enter a valid area code.");
        } else if (entity.phone.length === 0) {
            this.setError(worker, "Please enter a valid phone number.");
        } else if (entity.street.length === 0) {
            this.setError(worker, "Please enter a valid street.");
        } else if (entity.city.length === 0) {
            this.setError(worker, "Please enter a valid city.");
        } else if (entity.state.length === 0) {
            this.setError(worker, "Please enter a valid state.");
        } else if (entity.zip.length === 0) {
            this.setError(worker, "Please enter a valid zip.");
        } else {
            return true;
        }
    },
    create: function() {
        this.clearError();
        this.refs.create.show();
    },
    edit: function(entity) {
        this.setState({
            editing: entity
        });
        this.clearError();
        this.refs.edit.show();
    },
    delete: function(entity) {
        this.setState({
            deleting: entity
        });
        this.clearError();
        this.refs.edit.hide();
        this.refs.delete.show();
    },
    switch: function(entity) {
        entity.available = !entity.available;
        this._switch(entity);
    },
    _switch: function(entity) {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.edit,
            data: entity,
            timeout: 3000
        });
    },
    _create: function(entity) {
        this.work("create", true, "Creating...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("create", "Something was wrong...");
            } else {
                this.refs.create.hide();
                this.props.onEntityEdit({
                    type: 'create',
                    id: data.result.id
                });
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("create", "Something was wrong...");
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.create,
                data: entity,
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1300);
    },
    _edit: function(entity) {
        this.work("edit", true, "Saving...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("edit", "Something was wrong...");
            } else {
                this.refs.edit.hide();
                this.props.onEntityEdit({
                    type: 'edit',
                    id: this.state.editing.id
                });
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("edit", "Something was wrong...");
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.edit,
                data: entity,
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1300);
    },
    _delete: function(entity) {
        this.work("delete", true, "Deleting...");
        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("delete", "Something was wrong...");
            } else {
                this.refs.delete.hide();
                this.props.onEntityEdit();
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("delete", "Something was wrong...");
        }.bind(this);

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.delete,
                data: entity,
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1300);
    },
    work: function(worker, working, message) {
        var info = {};
        info[worker] = {
            working: working,
            message: message
        };
        this.setState({
            work_info: info
        });
    },
    stopWork: function() {
        this.setState({
            work_info: {}
        });
    },
    setError: function(worker, message) {
        var error = {};
        error[worker] = {
            message: message
        };
        this.setState({
            error: error
        });
    },
    clearError: function() {
        this.setState({
            error: {}
        });
    },
    render: function() {
        return (
            <div>
				<Modal ref="create" type="WaveModal">
                    <Create workInfo={this.state.work_info.create} error={this.state.error.create} onCreate={this.handleOnCreate} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="edit" type="WaveModal">
                    <Edit entity={this.state.editing} workInfo={this.state.work_info.edit} error={this.state.error.edit} onEdit={this.handleOnEdit} onDelete={this.delete} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="delete" type="WaveModal">
                    <ConfirmWindow workInfo={this.state.work_info.delete} error={this.state.error.delete} title="Are you sure?" onConfirm={this.handleOnDelete} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
            </div>
        );
    }
});

var ListPanel = React.createClass({
    getInitialState: function() {
        return {
            entities: [],
            keyword: "",
            get_list_api: "get_addresses"
        };
    },
    create: function() {
        this.refs.editor.create();
    },
    handleOnEntityEdit: function(e) {
        if (e) {
            if (e.type == "create") {
                this.created = e.id;
            } else if (e.type == "edit") {
                this.edited = e.id;
            }
        }
        this.getList();
    },
    getEventHandlers: function() {
        return {
            handleOnEdit: function(e) {
                this.refs.editor.edit(e);
            }.bind(this),
            handleOnSwitch: function(e) {
                this.refs.editor.switch(e);
            }.bind(this),
            handleOnSearch: function(e) {
                this.setState({
                    keyword: e.keyword
                });
            }.bind(this)
        };
    },
    getList: function() {
        if (this.busy) {
            return;
        }

        $.ajax({
            type: 'POST',
            url: this.props.APIs.get_list_api,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        entities: data.result.addresses
                    });
                }
            }.bind(this)
        });
    },
    getFilteredList: function() {
        this.busy = true;

        var entities = this.state.entities;
        for (var i in entities) {
            var entity = entities[i];
            entity.show = false;

            if (this.state.keyword.trim() !== "") {
                var content = entity.first_name + " ";
                content += entity.last_name + " ";
                content += entity.company + " ";
                content += entity.area + " ";
                content += entity.phone + " ";
                content += entity.street + " ";
                content += entity.apt + " ";
                content += entity.city + " ";
                content += entity.state + " ";
                content += entity.zip + " ";
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            if (this.created) {
                if (entity.id == this.created) {
                    entity.created = true;
                    this.created = null;
                }
            } else if (this.edited) {
                if (entity.id == this.edited) {
                    entity.edited = true;
                    this.edited = null;
                }
            }
            entity.show = true;
        }
        return entities;
    },
	componentDidMount: function() {
        this.busy = false;
        this.interval = setInterval(this.getList, 5000);
	},
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    componentDidUpdate: function() {
        this.busy = false;
    },
    render: function() {
        var handlers = this.getEventHandlers();
        return (
            <div className="AddressListPanel box-shadow--3dp">
                <Editor ref="editor" APIs={this.props.APIs} onEntityEdit={this.handleOnEntityEdit} />
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <ListToolbar onSearch={handlers.handleOnSearch} />
                    </div>
                    <div className="panel-body">
                        <List entities={this.getFilteredList()} onEntityEvents={handlers} />
                    </div>
                </div>
            </div>
        );
    }
});

var ListToolbar = React.createClass({
    handleOnChange: function(e) {
        this.props.onSearch({
            keyword: e
        });
    },
    render: function() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12">
                        <div className="inner-addon left-addon">
                            <i className="glyphicon glyphicon-search"></i>
                            <Input placeholder="Search Addresses" onChange={this.handleOnChange}></Input>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var List = React.createClass({
    getEntities: function() {
        var rows = [];
        var entities = this.props.entities;
        for (var i in entities) {
            if (entities[i].show) {
                rows.push(
                    <div key={entities[i].id} className="col-xs-12">
                        <Entity entity={entities[i]} onEntityEvents={this.props.onEntityEvents} />
                    </div>
                );
            }
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    {rows}
                </div>
            </div>
        );
    },
    render: function() {
        return (
            <div className="ListContainer">
                {this.getEntities()}
            </div>
        );
    }
});

var Entity = React.createClass({
    getCompany: function() {
        var company = this.props.entity.company;
        if (company) {
            return (
                <div>
                    <hr className="Separator" />
                    {company}
                </div>
            );
        }
        return null;
    },
    getStreet: function() {
        if (this.props.entity.apt) {
            return this.props.entity.street + ", " + this.props.entity.apt;
        }
        return this.props.entity.street;
    },
    render: function() {
        var entity = this.props.entity;
        var className = "Address box-shadow--2dp";
        if (entity.created) {
            className = "animated flash Address box-shadow--2dp";
        }
        return (
            <div className={className}>
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <Toolbar entity={entity} onEntityEvents={this.props.onEntityEvents} />
                    </div>
                    <div className="panel-body">
                        <b>
                            {entity.first_name + " " + entity.last_name}
                            <span className="pull-right">{entity.area + entity.phone}</span>
                        </b>
                        {this.getCompany()}
                        <hr className="Separator" />
                        {this.getStreet()}
                        <hr className="Separator" />
                        {entity.city + ", " + entity.state + ", " + entity.zip}
                    </div>
				</div>
            </div>
        );
    }
});

var Toolbar = React.createClass({
    handleOnEdit: function() {
        this.props.onEntityEvents.handleOnEdit(this.props.entity);
    },
    handleOnSwitch: function(e) {
        if (e === this.props.entity.available) {
            return;
        }
        this.props.onEntityEvents.handleOnSwitch(this.props.entity);
    },
    render: function() {
        return (
            <div>
                <button type="button" className="btn btn-warning btn-xs" onClick={this.handleOnEdit}>Edit</button>
                <div className="pull-right">
                    <Switch state={this.props.entity.available} onSwitch={this.handleOnSwitch} />
                </div>
            </div>
        );
    }
});

var Form = React.createClass({
    handleOnKeyDown: function(e) {
        if (e.keyCode === 13) {
            if (e.target === ReactDOM.findDOMNode(this.refs.firstName)) {
                if (ReactDOM.findDOMNode(this.refs.firstName).value === "dm") {
                    ReactDOM.findDOMNode(this.refs.firstName).value = "firstName " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.lastName).value = "lastName " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.company).value = "company " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.area).value = "area " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.phone).value = "phone " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.street).value = "street " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.apt).value = "apt " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.city).value = "city " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.state).value = "state " + UUID.v4().substring(0, 4);
                    ReactDOM.findDOMNode(this.refs.zip).value = "zip " + UUID.v4().substring(0, 4);
                    return;
                }
                ReactDOM.findDOMNode(this.refs.lastName).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.lastName)) {
                ReactDOM.findDOMNode(this.refs.company).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.company)) {
                ReactDOM.findDOMNode(this.refs.area).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.area)) {
                ReactDOM.findDOMNode(this.refs.phone).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.phone)) {
                ReactDOM.findDOMNode(this.refs.street).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.street)) {
                ReactDOM.findDOMNode(this.refs.apt).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.apt)) {
                ReactDOM.findDOMNode(this.refs.city).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.city)) {
                ReactDOM.findDOMNode(this.refs.state).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.state)) {
                ReactDOM.findDOMNode(this.refs.zip).focus();
            } else if (e.target === ReactDOM.findDOMNode(this.refs.zip)) {
                this.submit();
            }
        }
    },
    handleOnClick: function() {
        this.submit();
    },
    handleOnDelete: function() {
        this.props.onDelete(this.props.entity);
    },
    isSameEntity: function(e1, e2) {
        if (e1.first_name !== e2.first_name) {
            return false;
        }
        if (e1.last_name !== e2.last_name) {
            return false;
        }
        if (e1.company !== e2.company) {
            return false;
        }
        if (e1.area !== e2.area) {
            return false;
        }
        if (e1.phone !== e2.phone) {
            return false;
        }
        if (e1.street !== e2.street) {
            return false;
        }
        if (e1.apt !== e2.apt) {
            return false;
        }
        if (e1.city !== e2.city) {
            return false;
        }
        if (e1.state !== e2.state) {
            return false;
        }
        return e1.zip === e2.zip;
    },
    submit: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return;
        }

        var id = "";
        if (this.props.entity) {
            id = this.props.entity.id;
        }
        var available = true;
        if (this.props.entity) {
            available = this.props.entity.available;
        }
        var entity = {
            id: id,
            available: available,
            first_name: ReactDOM.findDOMNode(this.refs.firstName).value.trim(),
            last_name: ReactDOM.findDOMNode(this.refs.lastName).value.trim(),
            company: ReactDOM.findDOMNode(this.refs.company).value.trim(),
            area: ReactDOM.findDOMNode(this.refs.area).value.trim(),
            phone: ReactDOM.findDOMNode(this.refs.phone).value.trim(),
            street: ReactDOM.findDOMNode(this.refs.street).value.trim(),
            apt: ReactDOM.findDOMNode(this.refs.apt).value.trim(),
            city: ReactDOM.findDOMNode(this.refs.city).value.trim(),
            state: ReactDOM.findDOMNode(this.refs.state).value.trim(),
            zip: ReactDOM.findDOMNode(this.refs.zip).value.trim()
        };

        // If this is creating new address.
        if (!this.props.entity) {
            this.props.onClick(entity);
        } else if (this.isSameEntity(entity, this.props.entity)) {
            this.props.onClick(null);
        } else {
            this.props.onClick(entity);
        }
    },
    getError: function() {
        if (this.props.error) {
            return (
                <Alert style="danger" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getSaveButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-warning btn-block disabled">{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-warning btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
        );
    },
    getButtons: function() {
        if (this.props.delete) {
            return (
                <div className="row">
                    <div className="col-xs-6 RightExtend">
                        <button className="btn btn-danger btn-block" onClick={this.handleOnDelete}>Delete</button>
                    </div>
                    <div className="col-xs-6 LeftExtend">
                        {this.getSaveButton()}
                    </div>
                </div>
            );
        } else {
            return this.getSaveButton();
        }
    },
	render: function() {
        var entity = {};
        if (this.props.entity) {
            entity = this.props.entity;
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
                        <div className="form center-block">
                            {this.getError()}
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input ref="firstName" placeholder="First Name" onKeyDown={this.handleOnKeyDown}>{entity.first_name}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input ref="lastName" placeholder="Last Name" onKeyDown={this.handleOnKeyDown}>{entity.last_name}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input ref="company" placeholder="Company Name (optional)" onKeyDown={this.handleOnKeyDown}>{entity.company}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input ref="area" placeholder="Area Code" onKeyDown={this.handleOnKeyDown}>{entity.area}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input ref="phone" placeholder="Primary Phone" onKeyDown={this.handleOnKeyDown}>{entity.phone}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input ref="street" placeholder="Street Address" onKeyDown={this.handleOnKeyDown}>{entity.street}</Input>
                            </div>
                            <div className="form-group">
                                <Input ref="apt" placeholder="Apt, Suite, Bldg. (optional)" onKeyDown={this.handleOnKeyDown}>{entity.apt}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-4 RightExtend">
                                        <Input ref="city" placeholder="City" onKeyDown={this.handleOnKeyDown}>{entity.city}</Input>
                                    </div>
                                    <div className="col-xs-4 Extend">
                                        <Input ref="state" placeholder="State" onKeyDown={this.handleOnKeyDown}>{entity.state}</Input>
                                    </div>
                                    <div className="col-xs-4 LeftExtend">
                                        <Input ref="zip" placeholder="ZIP Code" onKeyDown={this.handleOnKeyDown}>{entity.zip}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                {this.getButtons()}
                            </div>
                        </div>
                    </div>
				</div>
			</div>
		);
	}
});

var Create = React.createClass({
    render: function() {
        return (
            <Form title="Create Post" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var Edit = React.createClass({
    render: function() {
        return (
            <Form entity={this.props.entity} delete={true} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onEdit} onDelete={this.props.onDelete} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

ReactDOM.render(
    <Index />,
    document.getElementById("body")
);
