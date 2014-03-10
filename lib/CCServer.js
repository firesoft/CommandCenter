var ccutils = require('./CCUtils');
var socket_io = require('socket.io');

function CCServer() {
	this.io = null;
}

CCServer.prototype.listen = function(port) {
	this.io = socket_io.listen(port, {'log level': 1});
	this.bindEvents();
}

CCServer.prototype.bindEvents = function() {
	this.io.sockets.on('connection', function (socket) {
		console.log('client connected');
		new CCServerClient(socket);
	});
}


function CCServerClient(socket) {
	this.socket = socket;
	this.authorized = false;
	
	this.bindEvents();
}

CCServerClient.prototype.bindEvents = function() {
	this.socket.on('authorize', this.processAuthorizationMessage.bind(this));
	this.socket.on('message', this.processMessage.bind(this));
	this.socket.on('disconnect', this.onDisconnect.bind(this));
	setTimeout(this.authorizationTimeout.bind(this), 30000);
}

CCServerClient.prototype.authorizationTimeout = function() {
	if (!this.authorized && this.socket) {
		console.log('diconnecting client');
		this.socket.disconnect();
	}
}

CCServerClient.prototype.processAuthorizationMessage = function(message) {
	console.log('authorization message: ' + message.toString());
	if (this.validateAuthorizeMessage(message)) {
		var group = message.group;
		this.joinGroup(group);
		this.authorized = true;
		this.socket.emit('authorize', {error: false});
	} else {
		this.socket.emit('authorize', {error: 'invalid message'});
	}
}

CCServerClient.prototype.joinGroup = function(group) {
	if (group instanceof Array) {
		for(var i=0; i<group.length; i++) {
			this.socket.join(group[i]);
		}
	} else if(typeof group == 'string') {
		this.socket.join(group);
	}
}

CCServerClient.prototype.processMessage = function(message) {
	console.log('message: ' + message);
	if (ccutils.validateMessage(message) && this.authorized) {
		this.socket.broadcast.to(message.to).emit('message', message);
	}
}

CCServerClient.prototype.onDisconnect = function(data) {
	console.log('disconnect');
	if (this.socket) {
		this.socket.removeAllListeners();
		this.authorized = false;
		this.socket = null;
	}
}

CCServerClient.prototype.validateAuthorizeMessage = function(message) {
	if (!message || typeof message != 'object') {
		return false;
	}
	
	if (!message.group) {
		return false;
	}
	
	if (typeof message.group != 'string' && message.group instanceof  Array) {
		return false
	}
	
	return true;
}

module.exports = CCServer;