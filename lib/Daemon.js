var p = require('path');
var SocketServer = require('./SocketServer');
var cst = require('../Constants');

process.title = 'asdf';

server = new SocketServer();

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
