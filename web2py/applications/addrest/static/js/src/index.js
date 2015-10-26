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
            user: null,
            base_link: base_link,
            APIs: {
                boards: base_link + "get_boards.json",
                create: base_link + "create_board.json",
                edit: base_link + "edit_board.json",
                delete: base_link + "delete_board.json",
                login: base_link + "login.json",
                signup: base_link + "signup.json",
                logout: base_link + "logout"
            }
        };
    },
    handleNavbarEvents: function() {
        this.refs.boardListPanel.getBoards();
    },
    handleOnUserChanged: function(user) {
        this.refs.navbar.setUser(user);
    },
    getButtons: function() {
        return [{
            onClick: function () {
                this.refs.boardListPanel.create();
            }.bind(this),
            text: "Create"
        }]
    },
	render: function() {
		return (
			<div>
				<Navbar ref="navbar" APIs={this.state.APIs} title="Boards" buttons={this.getButtons()} onNavbarEvents={this.handleNavbarEvents} />
                <BoardListPanel ref="boardListPanel" pollInterval={this.props.pollInterval} APIs={this.state.APIs} baseLink={this.state.base_link} onUserChanged={this.handleOnUserChanged} />
			</div>
		);
	}
});

var BoardEditor = React.createClass({
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
    edit: function(board) {
        this.setState({
            editing: board
        });
        this.clearError();
        this.refs.edit.show();
    },
    delete: function(board) {
        this.setState({
            deleting: board
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
                this.props.onBoardEdit();
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
                this.props.onBoardEdit();
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
    _delete: function(board) {
        this.work("delete", true, "Deleting...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("delete", "Something was wrong...");
            } else {
                this.refs.delete.hide();
                this.props.onBoardEdit();
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
                data: board,
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
                    <Edit board={this.state.editing} workInfo={this.state.work_info.edit} error={this.state.error.edit} onCreate={this.handleOnEdit} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="delete" type="WaveModal">
                    <ConfirmWindow workInfo={this.state.work_info.delete} error={this.state.error.delete} title="Are you sure?" onConfirm={this.handleOnDelete} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
            </div>
        );
    }
});

var BoardListPanel = React.createClass({
    getInitialState: function() {
        return {
            user: null,
            boards: [],
            keyword: ""
        };
    },
    create: function() {
        this.refs.editor.create();
    },
    handleOnBoardEdit: function() {
        this.getBoards();
    },
    getBoardEventHandlers: function() {
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
    getBoards: function() {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.boards,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        boards: data.result.boards,
                        user: data.result.user
                    });
                    this.props.onUserChanged(this.state.user);
                }
            }.bind(this)
        });
    },
    getFilteredBoards: function() {
        var boards = this.state.boards;
        for (var i in boards) {
            var board = boards[i];
            board.show = false;

            if (this.state.keyword.trim() !== "") {
                var content = board.title + " ";
                content += board.email;
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            board.show = true;
        }
        return boards;
    },
	componentDidMount: function() {
        this.getBoards();
        //this.interval = setInterval(this.getBoards, this.props.pollInterval);
	},
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        var handlers = this.getBoardEventHandlers();
        return (
            <div className="BoardListPanel box-shadow--3dp">
                <BoardEditor APIs={this.props.APIs} ref="editor" onBoardEdit={this.handleOnBoardEdit} />
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <BoardListToolbar onSearch={handlers.handleOnSearch} />
                    </div>
                    <div className="panel-body">
                        <BoardList baseLink={this.props.baseLink} user={this.state.user} boards={this.getFilteredBoards()} onBoardEvents={handlers} />
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Show more</button>
                    </div>
                </div>
            </div>
        );
    }
});

var BoardListToolbar = React.createClass({
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
                        <SearchTextBox onChange={this.handleOnChange}/>
                    </div>
                </div>
            </div>
        );
    }
});

var SearchTextBox = React.createClass({
    render: function() {
        return (
            <div className="inner-addon left-addon">
                <i className="glyphicon glyphicon-search"></i>
                <Input placeholder="Search Boards" onChange={this.props.onChange}></Input>
            </div>
        );
    }
});

var BoardList = React.createClass({
    getBoards: function() {
        var rows = [];
        var boards = this.props.boards;
        for (var i in boards) {
            if (boards[i].show) {
                rows.push(
                    <div key={i} className="col-xs-4">
                        <Board baseLink={this.props.baseLink} user={this.props.user} board={boards[i]} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                );
            }
        }
        return rows;
    },
    render: function() {
        return (
            <div className="container-fluid">
                <div className="row">
                    {this.getBoards()}
                </div>
            </div>
        );
    }
});

var Board = React.createClass({
    handleOnClick: function() {
        window.open(this.props.baseLink + "board/" + this.props.board.id);
    },
    render: function() {
        var board = this.props.board;
        var link;
        if (board.last_post_id) {
            link = (
                 <div className="pull-right HalfTitle">
                     <a className="Link" href={"get_post/" + board.last_post_id}>{board.last_post_title}</a>;
                 </div>
            );
        } else {
            link = <span className="label label-info LabelFont pull-right">None</span>;
        }
        return (
            <div className="Board box-shadow--3dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <BoardToolbar board={board} user={this.props.user} onBoardEvents={this.props.onBoardEvents} />
                    </div>
                    <div className="panel-body">
                        <b>
                            Recent Post
                            {link}
                        </b>
                        <hr className="Separator" />
                        <b>
                            Today Posts
                            <span className="label label-info LabelFont pull-right">{board.today_posts_number}</span>
                        </b>
                        <b>
                        <hr className="Separator" />
                            All Posts
                            <span className="label label-info LabelFont pull-right">{board.all_posts_number}</span>
                        </b>
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Open</button>
                    </div>
				</div>
            </div>
        );
    }
});

var BoardToolbar = React.createClass({
    handleOnEdit: function() {
        this.props.onBoardEvents.handleOnEdit(this.props.board);
    },
    handleOnDelete: function() {
        this.props.onBoardEvents.handleOnDelete(this.props.board);
    },
    getTitle: function() {
        if (this.props.user) {
            if (this.props.board.email) {
                if (this.props.user.email === this.props.board.email) {
                    return (
                        <div className="HalfTitle">
                            {this.props.board.title}
                        </div>
                    );
                }
            }
        }
        return (
            <div className="FullTitle">
                {this.props.board.title}
            </div>
        );
    },
    getButtons: function() {
        if (this.props.user) {
            if (this.props.board.email) {
                if (this.props.user.email === this.props.board.email) {
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

var BoardForm = React.createClass({
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
        if (this.props.board && this.props.board.title === title) {
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
        var board = {};
        if (this.props.board) {
            board = this.props.board;
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
                                <Input ref="title" placeholder="Board Title" size="input-md" onKeyDown={this.handleOnKeyDown}>{board.title}</Input>
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
            <BoardForm title="Create" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var Edit = React.createClass({
    render: function() {
        return (
            <BoardForm board={this.props.board} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

ReactDOM.render(
    <Index pollInterval={3500} />,
    document.getElementById("body")
);
