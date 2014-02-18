var net = require('net');
var util = require('util');
var CCSocket = require('./CCSocket');

function CCClientSocket(params) {
	CCSocket.call(this, params);
	
	this.reconnectTimeout = 1000;
	this.address = null;
}

util.inherits(CCClientSocket, CCSocket);

CCClientSocket.prototype.bindSocketEvents = function() {
	CCSocket.prototype.bindSocketEvents.call(this);
	this.socket.on('connect', this.onConnect.bind(this));
}

CCClientSocket.prototype.connect = function(address) {
	this.state = 'connecting';
	this.address = address;
	this.socket = net.connect(this.address);
	this.socket.setKeepAlive(true);
	this.bindSocketEvents();
}

CCClientSocket.prototype.onConnect = function() {
	this.resetReconnectTimeout();
	this.state = 'connected';
	this.emit('connect');
}

CCClientSocket.prototype.onEnd = function() {
	CCSocket.prototype.onEnd.call(this);
	this.tryReconnect();
}

CCClientSocket.prototype.onError = function(error) {
	CCSocket.prototype.onError.call(this, error);
	this.tryReconnect();
}

CCClientSocket.prototype.resetReconnectTimeout = function() {
	this.reconnectTimeout = 1000;
}

CCClientSocket.prototype.tryReconnect = function() {
	setTimeout(this.connect.bind(this, this.address), this.reconnectTimeout);
	this.updateReconnectTimeout();
}

CCClientSocket.prototype.updateReconnectTimeout = function() {
	this.reconnectTimeout *= 2;
	this.reconnectTimeout = Math.min(30000, this.reconnectTimeout);
}

module.exports = CCClientSocket;