
var net = require('net');
var p = require('path');
var util = require('util');

var cst = require('../Constants');
var SocketClient = require('./SocketClient');

var Titan = module.exports = {};

Titan.pingDaemon = function (callback){
    console.log('开始 pingDaemon')
    var client = new net.Socket();

    client.once('error', function(error) {
        console.log('Daemon不存在');
        process.nextTick(function() {
            return callback(false);
        });
    });

    client.once('connect', function() {
        console.log('Daemon存在');
        client.once('close', function() {
            return callback(true);
        });
        client.end();
    });

    client.connect(cst.DAEMON_BUS_PORT);
}


Titan.bootDaemon = function (config, callback){
    console.log('开始 bootDaemon');
    console.log('起子进程')
    var entranceJS = p.resolve(process.cwd(), config.entrance)
    console.log(entranceJS);
    var DaemonJS = p.resolve(p.dirname(module.filename), 'Daemon.js');
    var child = require('child_process').spawn(process.execPath || 'node', ['--harmony', DaemonJS], {
        detached   : true,
        cwd        : process.cwd(),
        env        : util._extend({
            APP_CWD : process.cwd(),
            APP_ENTRANCE : entranceJS
        }, process.env),
        stdio: ['ipc', 'ignore', 'ignore']
    });

    child.once('message', function(msg) {
        console.log(msg);
        child.unref();
        child.disconnect();
    });
    console.log('子进程pid:' + child.pid);
}

// Titan.test = function (){
//     var client = new SocketClient();
//
//     client.connect(cst.DAEMON_BUS_PORT, function (){
//         client.execute('add', 1, 2, function (result){
//             console.log(result);
//         })
//     });
// }
