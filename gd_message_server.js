var port = 8088;

var net = require('net');
var GDMessage = require('./GDMessage');
var CommandCenterException = require('./CommandCenterException');


var clients = new ServerClients();

var server = net.createServer(function(socket) {
	clients.addClient(socket);
});

server.listen(port);

/////////////

function ServerClients() {
	this.next_id = 1;
	this.clients = [];
}

ServerClients.prototype.addClient = function(socket) {
	this.clients.push(new ServerClient(this.next_id, socket, this));
	this.next_id++;
}

ServerClients.prototype.removeClient = function(client_id) {
	var index = this.findClientIndex(client_id);
	if (index != -1) {
		this.clients.splice(index, 1);
	}
}

ServerClients.prototype.findClientIndex = function(client_id) {
	for (var index=0; index<this.clients.length; index++) {
		if (this.clients[index].id == client_id) {
			return index;
		}
	}
	return -1;
}

/////////////

function ServerClient(client_id, socket, collection) {
	this.id = client_id // here generate next ID;
	this.socket = socket;
	this.authorized = false;
	this.group = null;
	
	this.collection = collection;
	
	this.bindEvents();
}

ServerClient.prototype.bindEvents = function() {
	this.socket.on('end', this.onConnectionEnd.bind(this));
	this.socket.on('data', this.onDataReceived.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

ServerClient.prototype.onConnectionEnd = function() {
	this.collection.removeClient(this.id);
	console.log('ending connection');
}

ServerClient.prototype.onError = function() {
	this.onConnectionEnd();
}


ServerClient.prototype.onDataReceived = function(data) {

	try {
		var message = this.parseData(data);
		
		if (!this.authorized) {
			this.authorize(message);
		} else {
			this.validateMessage(message);
			this.processMessage(message);
		}
	} catch(e) {
		this.sendMessage(new GDMessage(0, 'error', e.name, {message: e.message}));
	}
}

ServerClient.prototype.parseData = function(data) {
	var message = null
	try {
		message = new GDMessage(data);
	} catch (e) {
		throw new CommandCenterException('Message wrong format.');
	}
	return message;
}

ServerClient.prototype.authorize = function(message) {
	if (message.group != 'server' || message.command != 'authorize' || message.from != 0) {
		throw new CommandCenterException('Not authorized.');
	}
	if (!message.data.group) {
		throw new CommandCenterException('No group selected.');
	}
	this.authorized = true;
	this.group = message.data.group;
	this.sendMessage(new GDMessage(0, 'server', 'authorize', {id: this.id}));
}

ServerClient.prototype.validateMessage = function(message) {
	if (this.id != message.from) {
		throw new CommandCenterException('Message wrong format. Id wrong.');
	}
}

ServerClient.prototype.processMessage = function(message) {
}

ServerClient.prototype.isAuthorized = function() {
	return this.authorized;
}

ServerClient.prototype.sendMessage = function(message, callback) {
	this.socket.write(message.serialize(), callback);
}