var util = require('util');
var events = require('events');
var CCMessage = require('./CCMessage');
var CCClientSocket = require('./CCClientSocket');

function CCClient(params) {
	events.EventEmitter.call(this);
	this.socket = new CCClientSocket();
	this.status = 'offline';
	this.connectionAddress = {host: 'localhost', port: 8088};
	this.group = params.group;
	
	this.bindSocketEvents();
}

util.inherits(CCClient, events.EventEmitter);

CCClient.prototype.connect = function() {
	this.status = 'connecting';
	this.socket.connect(this.connectionAddress);
}

CCClient.prototype.onConnect = function() {
	this.status = 'connected';
	this.authorize();
}


CCClient.prototype.authorize = function() {
	this.sendMessage(new CCMessage(0, 'server', 'authorize', {group: this.group}));
}

CCClient.prototype.bindSocketEvents = function() {
	this.socket.on('connect', this.onConnect.bind(this));
	this.socket.on('message', this.onMessage.bind(this));
	this.socket.on('cannotConnect', this.onEnd.bind(this));
	this.socket.on('connectionLost', this.onEnd.bind(this));
	this.socket.on('connectionEnd', this.onEnd.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

CCClient.prototype.onMessage = function (message) {
	this.processMessage(message);
}

CCClient.prototype.processMessage = function(messageString) {

	var message = null;
	try {
		message = new CCMessage(messageString);
	} catch (e) {
		//here log message as error
		return;
	}
	if (this.status == 'connected') {
		this.processAuthorizeMessage(message);
	} else if (this.status == 'authorized') {
		this.emit('message', message.toObject());
	}
}

CCClient.prototype.onEnd = function() {
	this.status = 'offline';
}

CCClient.prototype.onError = function(error) {
	this.status = 'offline';
}

CCClient.prototype.sendMessage = function(message, callback) {
	this.socket.send(message.prepareToSend(), callback);
}

CCClient.prototype.processAuthorizeMessage = function(message) {
	if (message.from == 0 && message.group == 'server' && message.command == 'authorize') {
		this.status = 'authorized';
		this.emit('authorize');
	} else if (message.group == 'server' && message.command == 'error') {
		this.emit('error', message.data);
	} else {
		//here log message as error
	}
}

module.exports = CCClient;