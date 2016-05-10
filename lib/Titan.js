
var net = require('net');
var p = require('path');
var util = require('util');

var cst = require('../Constants');
var SocketClient = require('./SocketClient');

/**
 * Titan.
 */
var Titan = module.exports = {};

/**
 * ping daemon.
 *
 * @param {Function} callback
 * @api public
 */
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

    client.connect(cst.DAEMON_PRO_PORT);
}


Titan.bootDaemon = function (callback){
    console.log('开始 bootDaemon');
    console.log('起子进程');
    var DaemonJS = p.resolve(p.dirname(module.filename), 'Daemon.js');
    var child = require('child_process').spawn(process.execPath || 'node', ['--harmony', DaemonJS], {
        detached   : true,
        cwd        : process.cwd(),
        env        : util._extend({}, process.env),
        stdio: ['ipc', 'ignore', 'ignore']
    });

    child.once('message', function(msg) {
        console.log(msg);
        if (msg == 'success'){
            child.unref();
            child.disconnect();
            console.log('Titan Daemon 启动完毕');
            callback(true);
        } else {
            callback(false);
        }
    });
    console.log('子进程pid:' + child.pid);
}

Titan.startApp = function (config, callback){
    var client = new SocketClient();
    client.connect(cst.DAEMON_PRO_PORT, function (){
        client.execute('startApp', config, function (isOk){
            if (isOk){
                client.disconnect();
                callback(isOk);
            } else {
                callback(isOk);
            }

        })
    });
}

// Titan.test = function (){
//     var client = new SocketClient();
//
//     client.connect(cst.DAEMON_PRO_PORT, function (){
//         client.execute('add', 1, 2, function (result){
//             console.log(result);
//         })
//     });
// }
