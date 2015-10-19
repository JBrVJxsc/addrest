var React = require('react');

var Navbar = React.createClass({
    getButtons: function (buttons) {
        var buttonList = [];
        for (var i in buttons) {
            var button = buttons[i];
            buttonList.push(<NavbarButton onClick={button.onClick}>{button.text}</NavbarButton>);
        }
        return buttonList;
    },
	render: function() {
		return (
			<div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <div className="navbar-brand">Addrest</div>
                        </div>
                        <div className="collapse navbar-collapse">
                            <div className="navbar-form navbar-left">
                                {this.getButtons(this.props.buttons.left)}
                            </div>
                            <div className="navbar-form navbar-right">
                                {this.getButtons(this.props.buttons.right)}
                            </div>
                        </div>
                    </div>
                </nav>
			</div>
		);
	}
});

var NavbarButton = React.createClass({
    render: function () {
        return (
            <button type="button" className="btn btn-warning" onClick={this.props.onClick}>{this.props.children}</button>
        );
    }
});

module.exports = {
    Navbar: Navbar
};