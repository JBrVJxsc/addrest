var React = require('react');
var ReactDOM = require('react-dom');
var Moment = require('moment');
var Utils = require('./common').Utils;
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Alert = require('./common').Alert;
var ConfirmWindow = require('./common').ConfirmWindow;

var Index = React.createClass({
    getInitialState: function() {
        return {
            get_api_api: "get_api_api",
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
                    post_content: content,
                    board: this.props.boardID
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
            post_content: content,
            board: this.props.boardID
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
            get_list_api: "get_addresses",
            board_id: document.getElementById("BOARD_ID").textContent,
            post_id: document.getElementById("POST_ID").textContent
        };
    },
    create: function() {
        this.refs.editor.create();
    },
    handleOnClick: function() {
        this.list_size += 12;
        this.getList();
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
            data: {
                board: this.state.board_id,
                number: this.list_size
            },
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        entities: data.result.posts,
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
                var content = entity.title + " ";
                content += entity.email + " ";
                content += entity.post_content;
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            if (!this.highlighted) {
                if (entity.id == this.state.post_id) {
                    entity.highlight = true;
                    this.highlighted = true;
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
        this.list_size = 12;
        this.getList();
        this.interval = setInterval(this.getList, this.props.pollInterval);
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
            <div className="BoardListPanel box-shadow--3dp">
                <Editor boardID={this.state.board_id} APIs={this.props.APIs} ref="editor" onEntityEdit={this.handleOnEntityEdit} />
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <ListToolbar onSearch={handlers.handleOnSearch} />
                    </div>
                    <div className="panel-body">
                        <List entities={this.getFilteredList()} onEntityEvents={handlers} />
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="ShowMoreButton btn btn-info btn-sm" onClick={this.handleOnClick}>Show more</button>
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
                    <div className="col-xs-4">
                        <div className="inner-addon left-addon">
                            <i className="glyphicon glyphicon-search"></i>
                            <Input placeholder="Search Posts" onChange={this.handleOnChange}></Input>
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
                    <div key={entities[i].id} className="col-xs-4">
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
    render: function() {
        var entity = this.props.entity;
        var time = Moment(entity.create_time).fromNow();
        var className = "Board box-shadow--3dp";
        if (entity.highlight || entity.edited) {
            className = "animated pulse Board box-shadow--3dp";
        } else if (entity.created) {
            className = "animated flipInX Board box-shadow--3dp";
        }
        return (
            <div className={className}>
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <Toolbar entity={entity} onEntityEvents={this.props.onEntityEvents} />
                    </div>
                    <div className="panel-body">
                        <div className="ParagraphOverflow">
                            <p className="PreLine">{entity.post_content}</p>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <div>
                            <span className="LabelFont label label-info">Posted on {time}</span>
                        </div>
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
    getTitle: function() {
        if (this.props.user) {
            if (this.props.entity.email) {
                if (this.props.user.email === this.props.entity.email) {
                    return (
                        <div className="HalfTitle">
                            {this.props.entity.title}
                        </div>
                    );
                }
            }
        }
        return (
            <div className="FullTitle">
                {this.props.entity.title}
            </div>
        );
    },
    getButtons: function() {
        if (this.props.user) {
            if (this.props.entity.email) {
                if (this.props.user.email === this.props.entity.email) {
                    return (
                        <div className="pull-right">
                            <button ref="edit" type="button" className="btn btn-info btn-xs" onClick={this.handleOnEdit}>
                                <span className="glyphicon glyphicon-pencil" />
                            </button>
                            <button ref="delete" type="button" className="btn btn-info btn-xs" onClick={this.handleOnDelete}>
                                <span className="glyphicon glyphicon-trash" />
                            </button>
                        </div>
                    );
                }
            }
        }
    },
    render: function() {
        return (
            <div className="BoardToolbar">
                {this.getTitle()}
                {this.getButtons()}
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
    getButton: function() {
        if (this.props.workInfo && this.props.workInfo.working) {
            return (
                <button className="btn btn-info btn-block disabled" onClick={this.handleOnClick}>{this.props.workInfo.message}</button>
            );
        }
        return (
            <button className="btn btn-info btn-block" onClick={this.handleOnClick}>{this.props.button}</button>
        );
    },
    render: function() {
        var entity = {};
        if (this.props.entity) {
            entity = this.props.entity;
        }
        return (
			<div className="UserInfoModal">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <h3 className="panel-title"><div className="Overflow">{this.props.title}</div></h3>
                    </div>
                    <div className="panel-body">
                        <div className="form center-block">
                            {this.getError()}
                            <div className="form-group">
                                <Input ref="title" placeholder="Post Title" size="input-md" onKeyDown={this.handleOnKeyDown}>{entity.title}</Input>
                            </div>
                            <div className="form-group">
                                <textarea ref="content" className="form-control" placeholder="Write something..." rows="5" defaultValue={entity.post_content}></textarea>
                            </div>
                            <div className="UserInfoFormButton">
                                <div className="form-group">
                                    {this.getButton()}
                                </div>
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
            <Form entity={this.props.entity} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onEdit} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});













var Dashboard = React.createClass({
    getInitialState: function() {
        return {
            addresses: [
                {
                    show: true,
                    id: 0,
                    first_name: "Xu",
                    last_name: "ZHANG",
                    company: "",
                    area: "831",
                    phone: "2950944",
                    street: "700 Koshland Way",
                    apt: "A",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95060"
                },
                {
                    show: true,
                    id: 1,
                    first_name: "Han",
                    last_name: "Bai",
                    company: "Zenefits",
                    area: "831",
                    phone: "2950944",
                    street: "701 Koshland Way",
                    apt: "B",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95061"
                },
                {
                    show: true,
                    id: 2,
                    first_name: "Yue",
                    last_name: "Tian",
                    company: "Zenefits",
                    area: "831",
                    phone: "2950944",
                    street: "702 Koshland Way",
                    apt: "C",
                    city: "Santa Cruz",
                    state: "CA",
                    zip: "95062"
                }
            ],
            editing: null,
            keyword: ""
        };
    },
    getButtons: function() {
        return {
            left: [
                {
                    onClick: function() {
                        this.refs.create.toggle();
                    }.bind(this),
                    text: "Create"
                },
                {
                    onClick: function() {
                        console.log("Settings.");
                    }.bind(this),
                    text: "Settings"
                }
            ],
            right: [
                {
                    onClick: function() {
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
                this.setState(e);
            }.bind(this),
            handleEdit: function(e) {
                this.setState({
                    editing: e
                });
                this.refs.edit.toggle();
            }.bind(this)
        };
    },
    handleOnSave: function(e) {

    },
    handleOnDelete: function(e) {

    },
    getAddresses: function() {
        var addresses = this.state.addresses;
        for (var i in addresses) {
            var address = addresses[i];
            address.show = false;

            if (this.state.keyword.trim() !== "") {
                var content = address.first_name + " ";
                content += address.last_name + " ";
                content += address.company + " ";
                content += address.area + " ";
                content += address.phone + " ";
                content += address.street + " ";
                content += address.apt + " ";
                content += address.city + " ";
                content += address.state + " ";
                content += address.zip + " ";
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            address.show = true;
        }
        return addresses;
    },
    render: function() {
        return (
			<div>
				<Modal ref="create" type="WaveModal">
                    <Create onSave={this.handleOnSave} />
                </Modal>
                <Modal ref="edit" type="WaveModal" >
                    <Edit onSave={this.handleOnSave} onDelete={this.handleOnDelete} address={this.state.editing} />
                </Modal>
				<Navbar ref="navbar" buttons={this.getButtons()} />
                <AddressListPanel addresses={this.getAddresses()} eventHandlers={this.getEventHandlers()} />
			</div>
        );
    }
});

var AddressListPanel = React.createClass({
    render: function() {
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
    handleOnChange: function(e) {
        this.props.onSearch({
            keyword: e
        });
    },
    render: function() {
        return (
            <div>
                <SearchTextBox onChange={this.handleOnChange}/>
            </div>
        );
    }
});

var SearchTextBox = React.createClass({
    render: function() {
        return (
            <div className="inner-addon left-addon">
                <i className="glyphicon glyphicon-search"></i>
                <Input placeholder="Search Addresses" onChange={this.props.onChange}></Input>
            </div>
        );
    }
});

var AddressList = React.createClass({
    getAddresses: function() {
        var rows = [];
        var addresses = this.props.addresses;
        for (var i in addresses) {
            if (addresses[i].show) {
                rows.push(<Address key={i} address={addresses[i]} onEdit={this.props.onEdit} />);
            }
        }
        return rows;
    },
    render: function() {
        return (
            <div>
                {this.getAddresses()}
            </div>
        );
    }
});

var Address = React.createClass({
    getCompany: function() {
        var company = this.props.address.company;
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
        var address = this.props.address;
        var company = "";
        if (address.company) {
            company = address.company + ", ";
        }
        return (
            <div className="Address box-shadow--2dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <AddressToolbar address={this.props.address} onEdit={this.props.onEdit} />
                    </div>
                    <div className="panel-body">
                        <b>
                            {address.first_name + " " + address.last_name}
                            <span className="pull-right">{address.area + address.phone}</span>
                        </b>
                        {this.getCompany()}
                        <hr className="Separator" />
                        {address.street + ", " + address.apt}
                        <hr className="Separator" />
                        {address.city + ", " + address.state + ", " + address.zip}
                    </div>
				</div>
            </div>
        );
    }
});

var AddressToolbar = React.createClass({
    handleOnClick: function() {
        this.props.onEdit(this.props.address);
    },
    handleOnSwitch: function() {

    },
    render: function() {
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
    handleOnSave: function() {
        this.props.onSave(this.getAddress());
    },
    handleOnDelete: function() {
        this.props.onDelete(this.props.address);
    },
    getAddress: function() {
        return null;
    },
    getButtons: function() {
        if (this.props.delete) {
            return (
                <div className="row">
                    <div className="col-xs-6 RightExtend">
                        <button className="btn btn-danger btn-block" onClick={this.props.handleOnDelete}>Delete</button>
                    </div>
                    <div className="col-xs-6 LeftExtend">
                        <button className="btn btn-warning btn-block" onClick={this.props.handleOnSave}>Save</button>
                    </div>
                </div>
            );
        } else {
            return (
                <button className="btn btn-warning btn-block" onClick={this.props.handleOnSave}>Save</button>
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

ReactDOM.render(
    <Index />,
    document.getElementById("body")
);
