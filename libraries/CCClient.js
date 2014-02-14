var net = require('net');
var CCMessage = require('./CCMessage')

function CCClient(params) {
	this.socket = null;
	this.status = 'offline';
	this.connectionAddress = {host: 'localhost', port: 8088};
	this.group = params.group;
	
	//this.onConnectCallback
	//this.onAuthorizeCallback
	//this.onMessageCallback
	//this.onConnectionLostCallback
	//this.onCannotConnectCallback
}

CCClient.prototype.connect = function() {
	this.socket = net.connect(this.connectionAddress, this.onConnect.bind(this));
	this.bindSocketEvents();
}

CCClient.prototype.onConnect = function() {
	this.status = 'connected';
	
	if (this.onConnectCallback) {
		this.onConnectCallback();
	}
	
	this.authorize();
}


CCClient.prototype.authorize = function() {
	if (this.status == 'connected') {
		this.socket.sendMessage(new CCMessage(0, 'server', 'authorize', {group: this.group}));
	}
}

CCClient.bindSocketEvents = function() {
}

CCClient.prototype.onData = function (data) {
	
}

CCClient.prototype.sendMessage = function(message, callback) {
	if (this.status != 'offline') {
		this.socket.write(message.serialize(), function() {
			if (callback) {
				callback(true);
			}
		});
	} else if (callback) {
		callback(false);
	}
}


module.exports = CCClient;