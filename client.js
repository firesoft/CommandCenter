var cc = require('./index');
var client = cc.get('client');

client.connect('http://localhost:8088', 'test');