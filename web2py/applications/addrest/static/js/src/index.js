var React = require('react');
var ReactDOM = require('react-dom');
var Utils = require('./common').Utils;
var Navbar = require('./common').Navbar;
var Modal = require('./common').Modal;
var Input = require('./common').Input;
var Alert = require('./common').Alert;
var ConfirmWindow = require('./common').ConfirmWindow;

var Index = React.createClass({
    getInitialState: function() {
        var app = document.getElementById("APPLICATION").textContent;
        var controller = document.getElementById("CONTROLLER").textContent;
        var base_link = window.location.origin + "/" + app + "/" + controller + "/";
        return {
            base_link: base_link,
            get_api_api: base_link + "get_board_api.json",
            navbar_api: {
                login: base_link + "login.json",
                signup: base_link + "signup.json",
                logout: base_link + "logout"
            },
            APIs: {}
        };
    },
    handleNavbarEvents: function() {
        this.refs.listPanel.getList();
    },
    handleOnUserChanged: function(user) {
        this.refs.navbar.setUser(user);
        if (user === null) {
            this.user = null;
            return;
        }
        if (this.user === null || this.user.email !== user.email) {
            this.user = user;
            this.getAPIs();
        }
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
    componentDidMount: function() {
        this.user = null;
    },
	render: function() {
		return (
			<div>
				<Navbar ref="navbar" APIs={this.state.navbar_api} title="Boards" buttons={this.getButtons()} onNavbarEvents={this.handleNavbarEvents} />
                <ListPanel ref="listPanel" pollInterval={this.props.pollInterval} APIs={this.state.APIs} baseLink={this.state.base_link} onUserChanged={this.handleOnUserChanged} />
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
    handleOnCreate: function(title) {
        this.clearError();

        if (title.trim().length === 0) {
            this.setError("create", "Please enter a valid title.");
            return;
        }

        this._create(title);
    },
    handleOnEdit: function(title) {
        this.clearError();

        if (title === null) {
            this.refs.edit.hide();
            return;
        }

        if (title.trim().length === 0) {
            this.setError("edit", "Please enter a valid title.");
            return;
        }

        this._edit(title);
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
    _create: function(title) {
        this.work("create", true, "Creating...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("create", "Board title has been used.");
            } else {
                this.refs.create.hide();
                this.props.onEntityEdit(data.result.id);
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
                    title: title
                },
                error: error,
                success: callback,
                timeout: 3000
            });
        }.bind(this);

        setTimeout(delay, 800);
    },
    _edit: function(title) {
        this.work("edit", true, "Saving...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("edit", "Board title has been used.");
            } else {
                this.refs.edit.hide();
                this.props.onEntityEdit();
            }
        }.bind(this);

        var error = function() {
            this.stopWork();
            this.setError("edit", "Something was wrong...");
        }.bind(this);

        var data = {
            id: this.state.editing.id,
            title: title
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

        setTimeout(delay, 800);
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

        setTimeout(delay, 800);
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
            user: null,
            entities: [],
            keyword: "",
            get_list_api: this.props.baseLink + "get_boards.json"
        };
    },
    create: function() {
        this.refs.editor.create();
    },
    handleOnClick: function() {
        this.list_size += 10;
        this.getList();
    },
    handleOnEntityEdit: function(e) {
        if (e) {
            this.created = e;
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
        $.ajax({
            type: 'POST',
            url: this.state.get_list_api,
            data: {
                number: this.list_size
            },
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        entities: data.result.boards,
                        user: data.result.user
                    });
                    this.props.onUserChanged(this.state.user);
                }
            }.bind(this)
        });
    },
    getFilteredList: function() {
        var entities = this.state.entities;
        for (var i in entities) {
            var entity = entities[i];
            entity.show = false;

            if (this.state.keyword.trim() !== "") {
                var content = entity.title + " ";
                content += entity.email;
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            if (this.created) {
                if (entity.id == this.created) {
                    entity.created = true;
                    this.created = null;
                }
            }
            entity.show = true;
        }
        return entities;
    },
	componentDidMount: function() {
        this.list_size = 20;
        this.getList();
        this.interval = setInterval(this.getList, this.props.pollInterval);
	},
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        var handlers = this.getEventHandlers();
        return (
            <div className="BoardListPanel box-shadow--3dp">
                <Editor APIs={this.props.APIs} ref="editor" onEntityEdit={this.handleOnEntityEdit} />
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <ListToolbar onSearch={handlers.handleOnSearch} />
                    </div>
                    <div className="panel-body">
                        <List baseLink={this.props.baseLink} user={this.state.user} entities={this.getFilteredList()} onEntityEvents={handlers} />
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Show more</button>
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
                            <Input placeholder="Search Boards" onChange={this.handleOnChange}></Input>
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
                    <div key={i} className="col-xs-4">
                        <Entity baseLink={this.props.baseLink} user={this.props.user} entity={entities[i]} onEntityEvents={this.props.onEntityEvents} />
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
    handleOnClick: function() {
        window.open(this.props.baseLink + "board/" + this.props.entity.id);
    },
    render: function() {
        var entity = this.props.entity;
        var link;
        if (entity.last_post_id) {
            link = (
                 <div className="FullTitle">
                     <a className="Link" href={this.props.baseLink + "board/" + this.props.entity.id + "?post=" + entity.last_post_id} target="_blank">{entity.last_post_title}</a>
                 </div>
            );
        } else {
            link = (
                <div>
                <b>
                    Recent Post
                    <span className="label label-info LabelFont pull-right">None</span>
                </b>
                    </div>
            );
        }
        var className = entity.created ? "animated flipInX Board box-shadow--3dp" : "Board box-shadow--3dp";
        return (
            <div className={className}>
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <Toolbar entity={entity} user={this.props.user} onEntityEvents={this.props.onEntityEvents} />
                    </div>
                    <div className="panel-body">
                        <div className="BoardContent">
                            {link}
                            <hr className="Separator" />
                            <b>
                                Today Posts
                                <span className="label label-info LabelFont pull-right">{entity.today_posts_number}</span>
                            </b>
                            <b>
                            <hr className="Separator" />
                                All Posts
                                <span className="label label-info LabelFont pull-right">{entity.all_posts_number}</span>
                            </b>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Open</button>
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
                this.submit();
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
        if (this.props.entity && this.props.entity.title === title) {
            this.props.onClick(null);
            return;
        }
        this.props.onClick(title);
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
                                <Input ref="title" placeholder="Board Title" size="input-md" onKeyDown={this.handleOnKeyDown}>{entity.title}</Input>
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
            <Form title="Create Board" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
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

ReactDOM.render(
    <Index pollInterval={3500} />,
    document.getElementById("body")
);
