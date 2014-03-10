var CCClient = require('./lib/CCClient');
var CCServer = require('./lib/CCServer');

function CommandCenter() {
	this.client = null;
	this.server = null;
}

CommandCenter.prototype.get = function(type) {
	if (type == 'client') {
		return this.getClient();
	} else if (type == 'server') {
		return this.getServer();
	}
	
	throw new Error('unregognized service type');
}

CommandCenter.prototype.getClient = function() {
	if (!this.client) {
		this.client = new CCClient();
	}
	
	return this.client;
}

CommandCenter.prototype.getServer = function() {
	if (!this.server) {
		this.server = new CCServer();
	}
	
	return this.server;
}

module.exports = new CommandCenter();