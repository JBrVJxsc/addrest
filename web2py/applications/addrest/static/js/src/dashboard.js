var React = require('react');
var ReactDOM = require('react-dom');
var Moment = require('moment');
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
            get_api_api: "get_api",
            navbar_api: {
                login: "login",
                signup: "signup",
                logout: "logout",
                get_user: "get_user"
            },
            APIs: {}
        };
    },
    handleNavbarEvents: function(type) {
        this.refs.listPanel.getList();
    },
    handleOnUserChanged: function(user) {
        this.getAPIs();
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
				<Navbar ref="navbar" APIs={this.state.navbar_api} title="Addrest" buttons={this.getButtons()} onNavbarEvents={this.handleNavbarEvents} onUserChanged={this.handleOnUserChanged} />
                <ListPanel ref="listPanel" pollInterval={this.props.pollInterval} APIs={this.state.APIs} />
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
    handleOnCreate: function(title, content) {
        this.clearError();

        if (title.trim().length === 0) {
            this.setError("create", "Please enter a valid title.");
            return;
        }

        if (content.trim().length === 0) {
            this.setError("create", "Please write something...");
            return;
        }

        this._create(title, content);
    },
    handleOnEdit: function(title, content) {
        this.clearError();

        if (title === null) {
            this.refs.edit.hide();
            return;
        }

        if (title.trim().length === 0) {
            this.setError("edit", "Please enter a valid title.");
            return;
        }

        if (content.trim().length === 0) {
            this.setError("create", "Please write something...");
            return;
        }

        this._edit(title, content);
    },
    handleOnDelete: function(e) {
        if (e) {
            this._delete(this.state.deleting);
        } else {
            this.refs.delete.hide();
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
        this.refs.delete.show();
    },
    _create: function(title, content) {
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
                data: {
                    title: title,
                    post_content: content
                },
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 1300);
    },
    _edit: function(title, content) {
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

        var data = {
            id: this.state.editing.id,
            title: title,
            post_content: content
        };

        var delay = function() {
            $.ajax({
                type: 'POST',
                url: this.props.APIs.edit,
                data: data,
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
                    <Edit entity={this.state.editing} workInfo={this.state.work_info.edit} error={this.state.error.edit} onEdit={this.handleOnEdit} onAlertDismiss={this.handleOnAlertDismiss} />
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
            handleOnDelete: function(e) {
                this.refs.editor.delete(e);
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
            url: this.state.get_list_api,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        entities: data.addresses
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
        this.getList();
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
        return rows;
    },
    render: function() {
        return (
            <div className="ListContainer">
                <div className="container-fluid">
                    <div className="row">
                        {this.getEntities()}
                    </div>
                </div>
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
    render: function() {
        var entity = this.props.entity;
        var className = "Address box-shadow--2dp";
        if (entity.created) {
            className = "animated flipInX Address box-shadow--2dp";
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
                        {entity.street + ", " + entity.apt}
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
    handleOnDelete: function() {
        this.props.onEntityEvents.handleOnDelete(this.props.entity);
    },
    handleOnSwitch: function() {

    },
    render: function() {
        return (
            <div>
                <button type="button" className="btn btn-warning btn-xs" onClick={this.handleOnEdit}>Edit</button>
                <div className="pull-right">
                    <Switch address={this.props.address} state={true} onSwitch={this.handleOnSwitch} />
                </div>
            </div>
        );
    }
});

var Form = React.createClass({
    handleOnKeyDown: function(e) {
        if (e.keyCode === 13) {
            var title = ReactDOM.findDOMNode(this.refs.title);
            if (e.target === title) {
                var content = ReactDOM.findDOMNode(this.refs.content);
                content.focus();
                e.preventDefault();
            }
        }
    },
    handleOnClick: function() {
        this.submit();
    },
    submit: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return;
        }
        var title = ReactDOM.findDOMNode(this.refs.title).value;
        var content = ReactDOM.findDOMNode(this.refs.content).value;
        if (this.props.entity && this.props.entity.title === title && this.props.entity.post_content === content) {
            this.props.onClick(null);
            return;
        }
        this.props.onClick(title, content);
    },
    getError: function() {
        if (this.props.error) {
            return (
                <Alert style="warning" onDismiss={this.props.onAlertDismiss} title={this.props.error.title} message={this.props.error.message} />
            );
        }
    },
    getSaveButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-warning btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
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
                        <button className="btn btn-danger btn-block" onClick={this.props.handleOnDelete}>Delete</button>
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
                        <form className="form center-block">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input placeholder="First Name">{entity.first_name}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input placeholder="Last Name">{entity.last_name}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Company Name (optional)">{entity.company}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-6 RightExtend">
                                        <Input placeholder="Area Code">{entity.area}</Input>
                                    </div>
                                    <div className="col-xs-6 LeftExtend">
                                        <Input placeholder="Primary Phone">{entity.phone}</Input>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Street Address">{entity.street}</Input>
                            </div>
                            <div className="form-group">
                                <Input placeholder="Apt, Suite, Bldg. (optional)">{entity.apt}</Input>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-xs-4 RightExtend">
                                        <Input placeholder="City">{entity.city}</Input>
                                    </div>
                                    <div className="col-xs-4 Extend">
                                        <Input placeholder="State">{entity.state}</Input>
                                    </div>
                                    <div className="col-xs-4 LeftExtend">
                                        <Input placeholder="ZIP Code">{entity.zip}</Input>
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
    render: function() {
        return (
            <Form title="Create Post" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var Edit = React.createClass({
    render: function() {
        return (
            <Form entity={this.props.entity} delete={true} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onEdit} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

ReactDOM.render(
    <Index />,
    document.getElementById("body")
);
