var p = require('path');
var cluster = require('cluster');

var SocketServer = require('./SocketServer');
var cst = require('../Constants');

process.title = 'Titan Daemon';

var server = new SocketServer();

server.on('message', function (msg, sock){
    console.log(msg);
    sock.send('我收到啦');
});

server.expose({
    add: function (a, b){
        return a + b;
    }
})

server.bind(cst.DAEMON_BUS_PORT);
process.send('我是 Titan Daemon，我 OK 了！~')

cluster.setupMaster({
    exec : process.env.APP_ENTRANCE,
    args : ['--harmony']
});

cluster.fork();
cluster.fork();
