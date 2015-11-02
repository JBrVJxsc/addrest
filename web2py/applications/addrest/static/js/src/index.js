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
        return {
            navbar_api: {
                login: "login",
                signup: "signup",
                logout: "logout",
                get_user: "get_user"
            }
        };
    },
	render: function() {
		return (
			<div>
				<Navbar ref="navbar" APIs={this.state.navbar_api} title="Addrest" />
                <IndexBackground />
			</div>
		);
	}
});

var IndexBackground = React.createClass({
    render: function() {
        return (
            <div>
                <img src="/addrest/static/images/background-index.jpg" className="img-responsive" alt="Responsive image" />
            </div>
        );
    }
});

ReactDOM.render(
    <Index pollInterval={3500} />,
    document.getElementById("body")
);
