function CCUtils() {

}

CCUtils.prototype.validateMessage = function(message) {
	if (!message) {
		return false;
	}
	
	if (typeof message != 'object') {
		return false;
	}
	
	if (!message.to || !message.data) {
		return false
	}
	
	return true;
}

module.exports = new CCUtils;