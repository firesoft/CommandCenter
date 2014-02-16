var CCMessage = require('./CCMessage');
var CCException = require('./CCException');

function CCServerClient(client_id, socket, collection) {
	this.id = client_id // here generate next ID;
	this.socket = socket;
	this.authorized = false;
	this.group = null;
	
	this.collection = collection;
	
	this.bindEvents();
}

CCServerClient.prototype.bindEvents = function() {
	this.socket.on('end', this.onConnectionEnd.bind(this));
	this.socket.on('data', this.onDataReceived.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

CCServerClient.prototype.onConnectionEnd = function() {
	this.collection.removeClient(this.id);
	console.log('ending connection');
}

CCServerClient.prototype.onError = function() {
	this.onConnectionEnd();
}


CCServerClient.prototype.onDataReceived = function(data) {

	try {
		var message = new CCMessage(data);
		
		if (!this.authorized) {
			this.authorize(message);
		} else {
			this.validateMessage(message);
			this.processMessage(message);
		}
	} catch(e) {
		if (e instanceof CCException) {
			this.sendMessage(new CCMessage(0, 'server', 'error', {name: e.name, message: e.message}));
		} else {
			throw e;
		}
	}
}

CCServerClient.prototype.authorize = function(message) {
	if (message.group != 'server' || message.command != 'authorize' || message.from != 0) {
		throw new CCException('NOT_AUTHORIZED', 'Not authorized.');
	}
	if (!message.data.group) {
		throw new CCException('NO_GROUP', 'No group selected.');
	}
	this.authorized = true;
	this.group = message.data.group;
	this.sendMessage(new CCMessage(0, 'server', 'authorize', {id: this.id}));
}

CCServerClient.prototype.validateMessage = function(message) {
	if (this.id != message.from) {
		throw new CCException('WRONG_MESSAGE_FORMAT', 'Message wrong format: incompatible id\'s.');
	}
}

CCServerClient.prototype.processMessage = function(message) {
	this.collection.sendMessageToGroup(message);
}

CCServerClient.prototype.isAuthorized = function() {
	return this.authorized;
}

CCServerClient.prototype.sendMessage = function(message, callback) {
	this.socket.write(message.serialize(), callback);
}

module.exports = CCServerClient;