var util = require('util');
var underscore = require('underscore');
var CCSocket = require('./CCSocket');

function CCServerSocket(params) {
	CCSocket.call(this, params);
	this.socket = params.socket;
	this.state = 'connected';
	
	this.bindSocketEvents();
}

util.inherits(CCServerSocket, CCSocket);

module.exports = CCServerSocket;