var net = require('net');
var fs = require('fs');

console.log('我是 worker');
var server = net.createServer(function(connect) { // 'connection' 监听器
    connect.write('hello world');
    connect.end();
});
server.listen(8080);

// var name = require('./name');
// console.log(fs.readFileSync('file.js').toString());
