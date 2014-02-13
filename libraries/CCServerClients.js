var CCServerClient = require('./CCServerClient');

function CCServerClients() {
	this.next_id = 1;
	this.clients = [];
}

CCServerClients.prototype.addClient = function(socket) {
	this.clients.push(new CCServerClient(this.next_id, socket, this));
	this.next_id++;
}

CCServerClients.prototype.removeClient = function(client_id) {
	var index = this.findClientIndex(client_id);
	if (index != -1) {
		this.clients.splice(index, 1);
	}
}

CCServerClients.prototype.findClientIndex = function(client_id) {
	for (var index=0; index<this.clients.length; index++) {
		if (this.clients[index].id == client_id) {
			return index;
		}
	}
	return -1;
}

CCServerClients.prototype.sendMessageToGroup = function(message) {
	for (var index=0; index<this.clients.length; index++) {
		if (this.clients[index].group == message.group || message.group=='all') {
			this.clients[index].sendMessage(message, null);
		}
	}
}

module.exports = CCServerClients;