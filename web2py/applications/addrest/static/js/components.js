/**
 * Created by xuzhang on 10/8/15.
 */

var MainBody = React.createClass({
    componentDidMount: function() {
        
    },
    render: function() {
        return (
            <div>
                <Navbar ref="navbar" />
            </div>
        );
    }
});

var Navbar = React.createClass({
    handleSignUpOnClick: function() {
        this.refs.signup.toggle();
    },
    handleLogInOnClick: function() {
        this.refs.login.toggle();
    },
    render: function() {
        return (
            <div>
                <Modal ref="login" type="WaveModal" content={<Login />}/>
                <Modal ref="signup" type="WaveModal" content={<Signup />}/>
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

var Panel = React.createClass({
    render: function() {
        return (
            <div className="ModalPanel">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title">{this.props.title}</h3>
                  </div>
                  <div className="panel-body">
                      {this.props.children}
                  </div>
                </div>
            </div>
        );
    }
});

var Login = React.createClass({
    render: function() {
        return (
            <Panel title="Log In">
              <form className="form col-md-12 center-block">
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Email" />
                </div>
                <div className="form-group">
                  <input type="password" className="form-control" placeholder="Password" />
                </div>
                <div className="form-group">
                  <button className="btn btn-warning btn-block">Log In</button>
                </div>
              </form>
            </Panel>
        );
    }
});

var Signup = React.createClass({
    render: function() {
        return (
            <Panel title="Sign up">
              <form className="form col-md-12 center-block">
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Email" />
                </div>
                <div className="form-group">
                  <input type="password" className="form-control" placeholder="Password" />
                </div>
                <div className="form-group">
                  <button className="btn btn-warning btn-block">Sign up</button>
                </div>
              </form>
            </Panel>
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