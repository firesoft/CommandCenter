var events = require('events');
var util = require('util');
var CCError = require('./CCError');

function CCSocket() {
	events.EventEmitter.call(this);
	
	this.socket = null;
	this.state = 'offline';
	this.buffer = '';
}

util.inherits(CCSocket, events.EventEmitter);

CCSocket.prototype.bindSocketEvents = function() {
	this.socket.on('data', this.onData.bind(this));
	this.socket.on('end', this.onEnd.bind(this));
	this.socket.on('error', this.onError.bind(this));
}

CCSocket.prototype.onData = function(data) {
	this.buffer += data.toString();
	
	var messages = this.buffer.split('\n');
	if (messages.length > 0) {
		for (var i=0; i<messages.length-1; i++) {
			this.emit('message', messages[i]);
		}
		
		this.buffer = messages[messages.length-1];
	}
}

CCSocket.prototype.onEnd = function() {
	this.status = 'offline';
	this.socket = null;
	this.buffer = '';
	
	this.emit('connectionEnd');
}

CCSocket.prototype.onError = function (error) {
	this.status = 'offline';
	this.socket = null;
	this.buffer = '';
	
	if (error.code == 'ECONNREFUSED') {
		this.emit('cannotConnect');
	} else if (error.code == 'ECONNRESET') {
		this.emit('connectionLost');
	} else {
		this.emit('error', error);
	}
}

CCSocket.prototype.prepareMessage = function(message) {
	return message + '\n';
}

CCSocket.prototype.send = function(message, callback) {
	if (this.state == 'connected') {
		this.socket.write(this.prepareMessage(message),	callback);
	} else if (callback) {
		process.nextTick(function() {
			callback(new CCError('NOT_CONNECTED', 'Socket is not connected.'));
		});
	}
}

module.exports = CCSocket;