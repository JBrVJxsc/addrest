var React = require('react');
var ReactDOM = require('react-dom');
var PrettyDate = require("pretty-date");
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
            board_title: document.getElementById("BOARD_TITLE").textContent,
            APIs: {
                posts: base_link + "get_posts.json",
                create: base_link + "create_post.json",
                edit: base_link + "edit_post.json",
                delete: base_link + "delete_post.json",
                login: base_link + "login.json",
                signup: base_link + "signup.json",
                logout: base_link + "logout"
            }
        };
    },
    handleNavbarEvents: function() {
        this.refs.postListPanel.getPosts();
    },
    handleOnUserChanged: function(user) {
        this.refs.navbar.setUser(user);
    },
    getButtons: function() {
        return [{
            onClick: function () {
                this.refs.postListPanel.create();
            }.bind(this),
            text: "Create"
        }]
    },
	render: function() {
		return (
			<div>
				<Navbar ref="navbar" APIs={this.state.APIs} title={this.state.board_title} buttons={this.getButtons()} onNavbarEvents={this.handleNavbarEvents} />
                <PostListPanel ref="postListPanel" pollInterval={this.props.pollInterval} APIs={this.state.APIs} baseLink={this.state.base_link} onUserChanged={this.handleOnUserChanged} />
			</div>
		);
	}
});

var PostEditor = React.createClass({
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
    edit: function(post) {
        this.setState({
            editing: post
        });
        this.clearError();
        this.refs.edit.show();
    },
    delete: function(post) {
        this.setState({
            deleting: post
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
                this.props.onPostEdit();
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

        setTimeout(delay, 800);
    },
    _edit: function(title, content) {
        this.work("edit", true, "Saving...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("edit", "Something was wrong...");
            } else {
                this.refs.edit.hide();
                this.props.onPostEdit();
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
    _delete: function(post) {
        this.work("delete", true, "Deleting...");

        var callback = function(data) {
            this.stopWork();
            if (data.result.state === false) {
                this.setError("delete", "Something was wrong...");
            } else {
                this.refs.delete.hide();
                this.props.onPostEdit();
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
                data: post,
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
                    <Edit post={this.state.editing} workInfo={this.state.work_info.edit} error={this.state.error.edit} onEdit={this.handleOnEdit} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
				<Modal ref="delete" type="WaveModal">
                    <ConfirmWindow workInfo={this.state.work_info.delete} error={this.state.error.delete} title="Are you sure?" onConfirm={this.handleOnDelete} onAlertDismiss={this.handleOnAlertDismiss} />
                </Modal>
            </div>
        );
    }
});

var PostListPanel = React.createClass({
    getInitialState: function() {
        return {
            user: null,
            posts: [],
            keyword: "",
            board_id: document.getElementById("BOARD_ID").textContent
        };
    },
    create: function() {
        this.refs.editor.create();
    },
    handleOnClick: function() {
        this.post_number += 10;
        this.getPosts();
    },
    handleOnPostEdit: function() {
        this.getPosts();
    },
    getPostEventHandlers: function() {
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
    getPosts: function() {
        $.ajax({
            type: 'POST',
            url: this.props.APIs.posts,
            data: {
                board: this.state.board_id,
                number: this.post_number
            },
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        posts: data.result.posts,
                        user: data.result.user
                    });
                    this.props.onUserChanged(this.state.user);
                }
            }.bind(this)
        });
    },
    getFilteredPosts: function() {
        var posts = this.state.posts;
        for (var i in posts) {
            var post = posts[i];
            post.show = false;

            if (this.state.keyword.trim() !== "") {
                var content = post.title + " ";
                content += post.email;
                if (content.toLowerCase().indexOf(this.state.keyword.toLowerCase()) === -1) {
                    continue;
                }
            }

            post.show = true;
        }
        return posts;
    },
	componentDidMount: function() {
        this.post_number = 20;
        this.getPosts();
        this.interval = setInterval(this.getPosts, this.props.pollInterval);
	},
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        var handlers = this.getPostEventHandlers();
        return (
            <div className="BoardListPanel box-shadow--3dp">
                <PostEditor boardID={this.state.board_id} APIs={this.props.APIs} ref="editor" onPostEdit={this.handleOnPostEdit} />
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <PostListToolbar onSearch={handlers.handleOnSearch} />
                    </div>
                    <div className="panel-body">
                        <PostList baseLink={this.props.baseLink} user={this.state.user} posts={this.getFilteredPosts()} onPostEvents={handlers} />
                    </div>
                    <div className="panel-footer">
                        <button type="button" className="btn btn-info btn-xs" onClick={this.handleOnClick}>Show more</button>
                    </div>
                </div>
            </div>
        );
    }
});

var PostListToolbar = React.createClass({
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
                <Input placeholder="Search Posts" onChange={this.props.onChange}></Input>
            </div>
        );
    }
});

var PostList = React.createClass({
    getPosts: function() {
        var rows = [];
        var posts = this.props.posts;
        for (var i in posts) {
            if (posts[i].show) {
                rows.push(
                    <div key={i} className="col-xs-4">
                        <Post baseLink={this.props.baseLink} user={this.props.user} post={posts[i]} onPostEvents={this.props.onPostEvents} />
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
                    {this.getPosts()}
                </div>
            </div>
        );
    }
});

var Post = React.createClass({
    handleOnClick: function() {
        
    },
    render: function() {
        var post = this.props.post;
        return (
            <div className="Board box-shadow--3dp">
				<div className="panel panel-primary">
                    <div className="panel-heading">
                        <PostToolbar post={post} user={this.props.user} onPostEvents={this.props.onPostEvents} />
                    </div>
                    <div className="panel-body">
                        <p className="PreLine">{post.post_content}</p>
                    </div>
                    <div className="panel-footer">
                        <div>
                            <span className="LabelFont label label-info">Posted on {PrettyDate.format(new Date(post.create_time))}</span>
                        </div>
                    </div>
				</div>
            </div>
        );
    }
});

var PostToolbar = React.createClass({
    handleOnEdit: function() {
        this.props.onPostEvents.handleOnEdit(this.props.post);
    },
    handleOnDelete: function() {
        this.props.onPostEvents.handleOnDelete(this.props.post);
    },
    getTitle: function() {
        if (this.props.user) {
            if (this.props.post.email) {
                if (this.props.user.email === this.props.post.email) {
                    return (
                        <div className="HalfTitle">
                            {this.props.post.title}
                        </div>
                    );
                }
            }
        }
        return (
            <div className="FullTitle">
                {this.props.post.title}
            </div>
        );
    },
    getButtons: function() {
        if (this.props.user) {
            if (this.props.post.email) {
                if (this.props.user.email === this.props.post.email) {
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

var PostForm = React.createClass({
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
        if (this.props.post && this.props.post.title === title && this.props.post.post_content === content) {
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
        var post = {};
        if (this.props.post) {
            post = this.props.post;
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
                                <Input ref="title" placeholder="Post Title" size="input-md" onKeyDown={this.handleOnKeyDown}>{post.title}</Input>
                            </div>
                            <div className="form-group">
                                <textarea ref="content" className="form-control" placeholder="Write something..." rows="5">{post.post_content}</textarea>
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
            <PostForm title="Create Post" workInfo={this.props.workInfo} button="Create" error={this.props.error} onClick={this.props.onCreate} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

var Edit = React.createClass({
    render: function() {
        return (
            <PostForm post={this.props.post} title="Edit" workInfo={this.props.workInfo} button="Save" error={this.props.error} onClick={this.props.onEdit} onAlertDismiss={this.props.onAlertDismiss} />
        );
    }
});

ReactDOM.render(
    <Index pollInterval={3500} />,
    document.getElementById("body")
);
