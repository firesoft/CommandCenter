var util = require('util');
var underscore = require('underscore');
var CCSocket = require('./CCSocket');

function CCClientSocket(params) {
	CCSocket.call(this, params);
}

util.inherits(CCClientSocket, CCSocket);

CCClientSocket.prototype.bindSocketEvents = function() {
	CCSocket.prototype.bindSocketEvents.call(this);
	this.socket.on('connect', this.onConnect.bind(this));
}

CCSocket.prototype.onConnect = function() {
	this.state = 'connected';
	this.emit('connected');
}