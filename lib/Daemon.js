var p = require('path');
var SocketServer = require('./SocketServer');
var cst = require('../Constants');

process.title = 'asdf';
// process.send({ msg: '我daemon起来啦' });

// var socketServer = net.createServer(function (connect){
//     console.log('有连接进入');
//     connect.on('end', function() {
//         console.log('链接断开');
//     });
//
//     connect.on('data', function(data) {
//         console.log(data.toString());
//     })
//
//     connect.write('hello');
//
//     // connect.pipe(connect);
// });

socketServer = new SocketServer();

socketServer.on('message', function (msg, sock){
    console.log(msg);
    sock.write('我收到啦');
})
socketServer.bind(cst.DAEMON_BUS_PORT);
