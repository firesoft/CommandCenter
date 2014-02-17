var util = require('util');
var underscore = require('underscore');
var CCSocket = require('./CCSocket');

function CCServerSocket(params) {
	params = underscore.defaults(params, {autoReconnect: false});
	CCSocket.call(this, params);
	this.socket = params.socket;
	this.state = 'connected';
	
	this.bindSocketEvents();
}

util.inherits(CCServerSocket, CCSocket);

