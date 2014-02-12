var net = require('net');
var GDMessage = require('./GDMessage');

var connectionAddress = {host: 'localhost', port: 8088};

var client =  net.connect(connectionAddress, function() {
	console.log('connected!');
	
	var message = new GDMessage(0, 'server', 'authorize', {group: 'test_group'});
	client.write(message.serialize());
});

client.on('data', function(data) {
  console.log(data.toString());
});
client.on('end', function() {
  console.log('client disconnected');
});

client.on('error', function() {
  console.log('client disconnected');
});