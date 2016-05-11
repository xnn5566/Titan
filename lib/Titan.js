
var net = require('net');
var p = require('path');
var util = require('util');

var cst = require('../Constants');
var SocketClient = require('./SocketClient');

var client = new SocketClient();
var clientConnected = false;

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
    var nativeClient = new net.Socket();

    nativeClient.once('error', function(error) {
        console.log('Daemon不存在');
        process.nextTick(function() {
            return callback(false);
        });
    });

    nativeClient.once('connect', function() {
        console.log('Daemon存在');
        nativeClient.once('close', function() {
            return callback(true);
        });
        nativeClient.end();
    });

    nativeClient.connect(cst.DAEMON_PRO_PORT);
}

/**
 * boot daemon.
 *
 * @param {Function} callback
 * @api public
 */
Titan.bootDaemon = function (callback){
    console.log('开始 bootDaemon');
    console.log('起子进程');
    var DaemonJS = p.resolve(p.dirname(module.filename), 'Daemon.js');
    var child = null;
    try {
        child = require('child_process').spawn(process.execPath || 'node', ['--harmony', DaemonJS], {
            detached   : true,
            cwd        : process.cwd(),
            env        : util._extend({}, process.env),
            stdio: ['ipc', 'ignore', 'ignore']
        });
    } catch (err){
        callback(err);
        return false;
    }

    var err = false;
    child.once('message', function(msg) {
        if (msg == 'success'){
            child.unref();
            child.disconnect();
            console.log('Titan Daemon 启动完毕');
        } else {
            err = msg;
        }
        callback(err);
    });
    console.log('子进程pid:' + child.pid);
}

/**
 * kill daemon.
 *
 * @param {Function} callback
 * @api public
 */
Titan.killDaemon = function (callback) {
    console.log('开始 kill Daemon');
    var client = new SocketClient();
    execute('killDaemon');
    client.socket.on('end', function(){
        console.log('killed Daemon');
        callback();
    });
}


/**
 * start app.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
Titan.startApp = function (config, callback){
    execute('startAppWithCfg', config, function (err){
        callback(err);
        client.disconnect();
    });
}

/**
 * execute mothed.
 *
 * @api private
 */
function execute(){
    if (!clientConnected){
        process.nextTick(function (){
            execute.apply(null, arguments);
        });
    } else {
        client.execute.apply(client, arguments);
    }
}

/**
 * connect to socket.
 * when set 'clientConnected' to true
 */
client.connect(cst.DAEMON_PRO_PORT, function (){
    clientConnected = true;
})
