var util = require('util');
var events = require('events');
var net = require('net');
var CCMessage = require('./CCMessage');

function CCClient(params) {
	events.EventEmitter.call(this);
	this.socket = null;
	this.status = 'offline';
	this.connectionAddress = {host: 'localhost', port: 8088};
	this.group = params.group;
	this.buffer = '';
}

util.inherits(CCClient, events.EventEmitter);

CCClient.prototype.connect = function() {
	this.status = 'connecting';
	this.socket = net.connect(this.connectionAddress, this.onConnect.bind(this));
	this.bindSocketEvents();
}

CCClient.prototype.onConnect = function() {
	this.status = 'connected';
	this.emit('connected');
	
	this.authorize();
}


CCClient.prototype.authorize = function() {
	if (this.status == 'connected') {
		this.socket.sendMessage(new CCMessage(0, 'server', 'authorize', {group: this.group}));
	}
}

CCClient.bindSocketEvents = function() {
	this.socket.on('data', this.onData.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

CCClient.prototype.onData = function (data) {
	var message = null;
	try {
		message = new CCMessage(data);
	} catch (e) {
		//here log message as error
		return;
	}
	if (this.status == 'connected') {
		if (message.from == 0 && message.group == 'server' && message.command == 'authorize') {
			this.status = 'authorized';
			this.emit('authorized');
		} else if (message.group == 'server' && message.command == 'error') {
			this.emit('error', message.data);
		} else {
			//here log message as error
		}
	} else if (this.status == 'authorized') {
		this.emit('data', message);
	}
}

CCClient.prototype.onError = function(error) {
	if (error.code == 'ECONNREFUSED') {
		this.emit('cannotConnect');
	} else if (error.code == 'ECONNRESET') {
		this.status = 'offline';
		this.emit('connectionLost');
	} else {
		this.emit('error', error);
	}
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