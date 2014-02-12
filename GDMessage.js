function GDMessage(from, group, command, data) {
	if (arguments.length == 1) {
		this.initFromOneArgument(from);
	} else {
		this.from = from;
		this.group = group;
		this.command = command;
		this.data = data;
	}
}

GDMessage.prototype.initFromOneArgument = function(message) {

	if (typeof message == 'object' && message instanceof Buffer) {
		message = message.toString();
	}

	if (typeof message == 'string') {
		message = JSON.parse(message);
	}
	
	this.from = message.from;
	this.group = message.group;
	this.command = message.command;
	this.data = message.data;
}

GDMessage.prototype.serialize = function() {
	return JSON.stringify({from: this.from, group: this.group, command: this.command, data: this.data});
}

module.exports = GDMessage;