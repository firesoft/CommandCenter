var port = 8088;

var net = require('net');
var CCServerClients = require('./CCServerClients');

function CCServer()
{
	this.server = null;
	this.clients = new CCServerClients();
}

CCServer.prototype.run = function() {
	this.server = net.createServer(this.onClientConnect.bind(this));
	this.server.listen(port);
}

CCServer.prototype.onClientConnect = function(socket) {
	this.clients.addClient(socket);
}

module.exports = CCServer;