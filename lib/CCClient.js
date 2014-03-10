var io = require('socket.io-client');
var util = require('util');
var events = require('events');
var ccutils = require('./CCUtils');

function CCClient() {
	events.EventEmitter.call(this);
	this.socket = null;
	this.url = '';
	
	this.authorized = false;
	
	this.resetReconnectTimeout();
}

util.inherits(CCClient, events.EventEmitter);

CCClient.prototype.send = function(to, data) {
	if (this.authorized && this.socket) {
		this.socket.emit('message', {to: to, data: data});
	}
}

CCClient.prototype.resetReconnectTimeout = function() {
	this.reconnectTimeout = 1000;
}

CCClient.prototype.connect = function(url, group) {
	console.log('connecting');
	
	this.url = url;
	this.group = group;
	this.socket = io.connect(url, {"force new connection": true, "reconnect": false});
	
	this.bindEvents();
}

CCClient.prototype.tryReconnect = function() {
	console.log('connection lost or cannot connect');
	this.emit('connection_lost');
	this.authorized = false;
	setTimeout(this.reconnect.bind(this), this.reconnectTimeout);
	this.updateReconnectTimeout();
}

CCClient.prototype.reconnect = function() {
	this.socket.removeAllListeners();
	this.connect(this.url, this.group);
}

CCClient.prototype.updateReconnectTimeout = function() {
	this.reconnectTimeout *= 2;
	this.reconnectTimeout = Math.min(30000, this.reconnectTimeout);
}

CCClient.prototype.bindEvents = function() {
	this.socket.on('connect', this.onConnect.bind(this));
	this.socket.on('message', this.onMessage.bind(this));
	this.socket.on('authorize', this.onAuthorizeMessage.bind(this));
	this.socket.on('disconnect', this.tryReconnect.bind(this));
	this.socket.on('error', this.tryReconnect.bind(this));
	this.socket.on('connect_failed', this.tryReconnect.bind(this));
}

CCClient.prototype.onMessage = function(message) {
	console.log('message: ' + message);
	if (this.authorized && ccutils.validateMessage(message)) {
		this.emit('message', message);
	}
}

CCClient.prototype.onAuthorizeMessage = function(message) {
	console.log('authorize message: ' + message);
	if (this.validateAuthorizeMessage(message)) {
		this.authorized = true;
		this.emit('connected');
	}
}

CCClient.prototype.onConnect = function() {
	console.log('connected');
	this.resetReconnectTimeout();
	this.socket.emit('authorize', {group:this.group});
}

CCClient.prototype.validateAuthorizeMessage = function(message) {
	if (!message || typeof message != 'object') {
		return false;
	}
	
	if (message.error) {
		return false;
	}
	
	return true;
}

module.exports = CCClient;