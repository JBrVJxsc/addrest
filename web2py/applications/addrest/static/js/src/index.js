var React = require('react');
var ReactDOM = require('react-dom');
var Navbar = require('./common').Navbar;

var Index = React.createClass({
    handleOnUserLoggedIn: function() {
        // If user logged in, then we redirect to dashboard.
        window.location.replace("dashboard");
    },
    render: function() {
		return (
			<div>
				<Navbar ref="navbar" title="Addrest" onUserLoggedIn={this.handleOnUserLoggedIn} />
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
    <Index />,
    document.getElementById("body")
);
