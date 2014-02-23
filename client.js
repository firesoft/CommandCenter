var commandcenter = require('./index.js');

var client = new commandcenter.CCClient();

client.on('error', function(error) {
	console.log('error: '+ error);
});

client.on('cannotConnect', function(error) {
	console.log('error: '+ error);
});

client.on('message', function(message) {
	console.log('message received: '+ message);
});

client.on('authorize', function() {
	console.log('authorized event');
});

client.connect({host: 'localhost', port: 8088}, 'test');

/*var CCClient = require('./libraries/CCClient');

var client = new CCClient({group: 'test'});

client.on('error', function(error) {
	console.log('error: '+ error);
});

client.on('message', function(message) {
	console.log('message received: '+ message);
});

client.on('authorize', function() {
	console.log('authorized event');
});

client.connect();*/