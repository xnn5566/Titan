var cst = require('../Constants');
var net = require('net');
var p = require('path');

var Titan = module.exports = {};

Titan.pingDaemon = function (callback){
    console.log('开始 pingDaemon')
    var client = new net.Socket();

    client.once('error', function(error) {
        console.log(error)
        console.log('Daemon不存在');
        process.nextTick(function() {
            return callback(false);
        });
    });

    client.once('connect', function() {
        console.log('Daemon存在')
        client.once('close', function() {
            return callback(true);
        });
        client.close();
    });

    client.connect(cst.DAEMON_RPC_PORT);
}


Titan.bootDaemon = function (callback){
    console.log('开始 bootDaemon');
    console.log('起子进程')
    var DaemonJS = p.resolve(p.dirname(module.filename), 'Daemon.js');
    var child = require('child_process').spawn(process.execPath || 'node', ['--harmony', DaemonJS], {
        detached   : true,
        cwd        : process.cwd(),
        env        : process.env,
        stdio: ['ipc', 'ignore', 'ignore']
    });

    child.once('message', function(msg) {
        console.log(msg);
        child.unref();
        child.disconnect();
    });
    console.log(child.pid);
}
