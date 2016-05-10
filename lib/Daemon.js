var SocketServer = require('./SocketServer');
var cst = require('../Constants');
var Zeus = require('./Zeus');

process.title = 'Titan Daemon';

// 创建 socket server
var server = new SocketServer();
server.bind(cst.DAEMON_PRO_PORT, function (){
    // 将 Zeus 的方法全部 expose 出去
    server.expose(Zeus);
    // socket server 启动完事就算启动成功
    // process.send('success');
});

server.on('message', function (msg){
    console.log(msg)
})


// server.expose({
//     add: function (a, b){
//         return a + b;
//     }
// })
