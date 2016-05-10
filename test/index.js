var net = require('net');
var server = net.createServer(function(connect) { // 'connection' 监听器
    connect.write('hello');
    connect.end();
});
server.listen(8080);
// console.log(process.cwd())
// console.log(process.env)
// console.log(module.filename)
