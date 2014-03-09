var CCMessage = require('./CCMessage');
var CCError = require('./CCError');
var CCServerSocket = require('./CCServerSocket');

function CCServerClient(client_id, socket, collection) {
	this.id = client_id;
	this.socket = new CCServerSocket({socket: socket});
	
	this.authorized = false;
	this.group = null;
	this.collection = collection;
	
	this.bindEvents();
}

CCServerClient.prototype.bindEvents = function() {
	this.socket.on('connectionEnd', this.onConnectionEnd.bind(this));
	this.socket.on('connectionLost', this.onConnectionEnd.bind(this));
	this.socket.on('message', this.onMessage.bind(this));
	this.socket.on('otherError', this.onError.bind(this));
}

CCServerClient.prototype.onConnectionEnd = function() {
	this.authorized = false;
	if (this.collection) {
		this.collection.removeClient(this.id);
		this.collection = null;
	}
}

CCServerClient.prototype.onError = function() {
	this.onConnectionEnd();
}


CCServerClient.prototype.onMessage = function(message) {
	this.parseMessage(message);
}

CCServerClient.prototype.parseMessage = function(data) {
	try {
		var message = new CCMessage(data);
		
		if (!this.authorized) {
			this.authorize(message);
		} else {
			this.validateMessage(message);
			this.processMessage(message);
		}
	} catch(e) {
		if (e instanceof CCError) {
			this.sendMessage(new CCMessage(0, 'server', 'error', {name: e.name, message: e.message}));
		} else {
			throw e;
		}
	}
}

CCServerClient.prototype.authorize = function(message) {
	if (message.group != 'server' || message.command != 'authorize' || message.from != 0) {
		throw new CCError('NOT_AUTHORIZED', 'Not authorized.');
	}
	if (!message.data.group) {
		throw new CCError('NO_GROUP', 'No group selected.');
	}
	this.authorized = true;
	this.group = message.data.group;
	this.sendMessage(new CCMessage(0, 'server', 'authorize', {id: this.id}));
}

CCServerClient.prototype.validateMessage = function(message) {
	if (this.id != message.from) {
		throw new CCError('WRONG_MESSAGE_FORMAT', 'Message wrong format: incompatible id\'s.');
	}
}

CCServerClient.prototype.processMessage = function(message) {
	this.collection.sendMessageToGroup(message);
}

CCServerClient.prototype.isAuthorized = function() {
	return this.authorized;
}

CCServerClient.prototype.sendMessage = function(message, callback) {
	this.socket.send(message.prepareToSend(), callback);
}

module.exports = CCServerClient;