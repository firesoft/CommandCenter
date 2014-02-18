var CCError = require('./CCError');

function CCMessage(from, group, command, data) {
	if (arguments.length == 1) {
		this.initFromOneArgument(from);
	} else {
		this.from = from;
		this.group = group;
		this.command = command;
		this.data = data;
	}
}

CCMessage.prototype.initFromOneArgument = function(message) {
	try {
		if (typeof message == 'string') {
			message = JSON.parse(message);
		}
		
		this.checkObjectParams(message);
		
		this.from = message.from;
		this.group = message.group;
		this.command = message.command;
		this.data = message.data;
		
	} catch (e) {
		throw new CCError('WRONG_MESSAGE_FORMAT', 'Message wrong format.');
	}
}

CCMessage.prototype.checkObjectParams = function(message) {
	if (typeof message.from == 'undefined' || typeof message.group == 'undefined' || typeof message.command == 'undefined' || typeof message.data == 'undefined') {
		throw new CCError('WRONG_MESSAGE_FORMAT', 'Message wrong format.');
	}
}

CCMessage.prototype.prepareToSend = function() {
	return JSON.stringify(this.toObject());
}

CCMessage.prototype.toObject = function() {
	return {from: this.from, group: this.group, command: this.command, data: this.data};
}

module.exports = CCMessage;