var net = require('net');
var events = require('events');
var underscore = require('underscore');

function CCSocket(params) {
	events.EventEmitter.call(this);
	
	params = underscore(params, {autoReconnect: true});
	
	this.socket = null;
	this.address = null;
	this.state = 'offline';
	this.buffer = '';
	this.autoReconnect = params.autoReconnect;
	this.reconnectTimeout = 1000;
}

util.inherits(CCSocket, events.EventEmitter);

CCSocket.prototype.connect = function(address) {
	this.state = 'connecting';
	this.address = address;
	this.reconnectTimeout = 1000;
	this.socket = net.connect(this.address);
	this.socket.setKeepAlive(true);
	this.bindSocketEvents();
}

CCSocket.prototype.onConnect = function() {
	this.state = 'connected';
	this.emit('connected');
}

CCSocket.prototype.bindSocketEvents = function() {
	this.socket.on('connect', this.onConnect.bind(this));
	this.socket.on('data', this.onData.bind(this));
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

CCSocket.prototype.onError = function (error) {
	this.status = 'offline';
	this.socket = null;
	this.buffer = '';
	if (this.autoReconnect) {
		this.tryReconnect();
	} else if (error.code == 'ECONNREFUSED') {
		this.emit('cannotConnect');
	} else if (error.code == 'ECONNRESET') {
		this.emit('connectionLost');
	} else {
		this.emit('otherError', error);
	}
}

CCSocket.prototype.tryReconnect = function() {
	setTimeout(this.connect.bind(this), this.reconnectTimeout);
	this.updateReconnectTimeout();
}

CCSocket.prototype.updateReconnectTimeout = function() {
	this.reconnectTimeout *= 2;
	this.reconnectTimeout = Math.min(30000, this.reconnectTimeout);
}

CCSocket.prototype.prepareMessage = function(message) {
	return message + '\n';
}

CCSocket.prototype.send = function(message, callback) {
	if (this.state == 'connected') {
		this.socket.write(this.prepareMessage(message), function() {
			callback(null);
		});
	} else {
		process.nextTick(function() {
			callback(new CCError('NOT_CONNECTED', 'Socket is not connected.'));
		})
	}
}

module.exports = CCSocket;