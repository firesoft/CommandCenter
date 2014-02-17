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
	this.reconnectTime = 1000;
}

util.inherits(CCClient, events.EventEmitter);

CCClient.prototype.connect = function() {
	this.status = 'connecting';
	this.socket = net.connect(this.connectionAddress, this.onConnect.bind(this));
	this.bindSocketEvents();
}

CCClient.prototype.onConnect = function() {
	this.resetReconnectTime();
	this.status = 'connected';
	this.authorize();
}


CCClient.prototype.authorize = function() {
	if (this.status == 'connected') {
		this.sendMessage(new CCMessage(0, 'server', 'authorize', {group: this.group}));
	}
}

CCClient.prototype.bindSocketEvents = function() {
	this.socket.on('data', this.onData.bind(this));
	this.socket.on('end', this.onEnd.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

CCClient.prototype.onData = function (data) {

	this.buffer += data.toString();
	
	var messages = this.buffer.split('\n');
	if (messages.length > 0) {
		for (var i=0; i<messages.length-1; i++) {
			this.parseData(messages[i]);
		}
		
		this.buffer = messages[messages.length-1];
	}
}

CCClient.prototype.parseData = function(messageString) {

	var message = null;
	try {
		message = new CCMessage(messageString);
	} catch (e) {
		//here log message as error
		return;
	}
	if (this.status == 'connected') {
		if (message.from == 0 && message.group == 'server' && message.command == 'authorize') {
			this.status = 'authorized';
			this.emit('authorize');
		} else if (message.group == 'server' && message.command == 'error') {
			this.emit('error', message.data);
		} else {
			//here log message as error
		}
	} else if (this.status == 'authorized') {
		this.emit('message', message.toObject());
	}
}

CCClient.prototype.onEnd = function() {
	this.status = 'offline';
		this.tryReconnect();
		this.emit('connectionEnd');
}

CCClient.prototype.onError = function(error) {
	if (error.code == 'ECONNREFUSED') {
		this.status = 'offline';
		this.tryReconnect();
		this.emit('cannotConnect');
	} else if (error.code == 'ECONNRESET') {
		this.status = 'offline';
		this.tryReconnect();
		this.emit('connectionLost');
	} else {
		this.emit('error', error);
	}
	
}

CCClient.prototype.sendMessage = function(message, callback) {
	if (this.status != 'offline') {
		this.socket.write(message.prepareToSend(), function() {
			if (callback) {
				callback(true);
			}
		});
	} else if (callback) {
		callback(false);
	}
}

CCClient.prototype.resetReconnectTime = function() {
	this.reconnectTime = 1000;
}

CCClient.prototype.increaseReconnectTime = function() {
	this.reconnectTime *= 2;
	
	if (this.reconnectTime> 30000)
		this.reconnectTime = 30000;
}

CCClient.prototype.tryReconnect = function() {
	console.log('tryin reconnect after: ' + (this.reconnectTime/1000) + 's');
	setTimeout(this.connect.bind(this), this.reconnectTime);
	this.increaseReconnectTime();
}

module.exports = CCClient;