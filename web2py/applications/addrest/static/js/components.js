/**
 * Created by xuzhang on 10/8/15.
 */

var MainBody = React.createClass({
    componentDidMount: function() {

    },
    render: function() {
        return (
            <div>
                <Navbar />
            </div>
        );
    }
});

var Navbar = React.createClass({
    handleSignUpOnClick: function() {

    },
    handleLogInOnClick: function() {
        this.refs.login.toggle();
    },
    render: function() {
        return (
            <div>
                <Modal ref="login" type="ScaleModal" content={<Login />}/>
                <nav className="navbar navbar-default navbar-fixed-top">
                  <div className="container-fluid">
                    <div className="navbar-header">
                      <div className="navbar-brand">Addrest</div>
                    </div>
                    <div className="collapse navbar-collapse">
                      <div className="navbar-form navbar-right">
                        <button type="button" className="btn btn-warning" onClick={this.handleSignUpOnClick}>Sign up</button>
                          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <button type="button" className="btn btn-warning" onClick={this.handleLogInOnClick}>Log In</button>
                      </div>
                    </div>
                  </div>
                </nav>
            </div>
        );
    }
});

var Login = React.createClass({
    render: function() {
        return (
            <div id="login">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title">Log In</h3>
                  </div>
                  <div className="panel-body">
                    Panel content
                  </div>
                </div>
            </div>
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
            <Dialog ref="dialog">{this.props.content}</Dialog>
        )
    }
});