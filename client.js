var CCClient = require('./libraries/CCClient');

var client = new CCClient({group: 'test'});

client.on('error', function(error) {
	console.log(error);
});

client.on('message', function(message) {
	console.log(message);
});

client.on('authorize', function() {
	console.log('authorized');
});

client.connect();