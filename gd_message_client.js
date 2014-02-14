var net = require('net');
var CCMessage = require('./libraries/CCMessage');

var connectionAddress = {host: 'localhost', port: 8088};

var client =  net.connect(connectionAddress, function() {
	console.log('connected!');
	
	var message = new CCMessage(0, 'server', 'authorize', {group: 'test_group'});
	client.write(message.serialize());
	
	setTimeout(function() {
		var message = new CCMessage(1, 'all', 'fuck you!', {message: 'fakju bicz'});
		client.write(message.serialize());
	}, 1000);
});

client.on('data', function(data) {
  console.log(data.toString());  
});
client.on('end', function() {
  console.log('client disconnected');
});

client.on('error', function(error) {

  console.log(error);
});