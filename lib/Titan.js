
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
 * connect to daemon.
 *
 * @param {Function} callback
 */
Titan.connectDaemon = function (callback){
    pingDaemon(function (isOk){
        if(isOk){
            clientConnect(callback);
        } else {
            bootDaemon(function (){
                clientConnect(callback);
            })
        }
    })
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
    clientExecute('killDaemon');
    client.socket.on('end', function(){
        console.log('killed Daemon OK');
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
    clientExecute('startAppWithCfg', config, function (err){
        callback(err);
        clientDisconnect();
    });
}

/**
 * start app.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
 Titan.disconnect = function (){
     if (clientConnected){
         client.disconnect();
         clientConnected = false;
     }
 }

/**
 * ping daemon.
 *
 * @param {Function} callback
 * @api private
 */
function pingDaemon(callback){
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
 * @api private
 */
function bootDaemon(callback){
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

function clientConnect(callback){
    if (clientConnected){
        callback();
    }
    try {
        client.connect(cst.DAEMON_PRO_PORT, function (){
            clientConnected = true;
            callback();
        })
    } catch (e){
        console.log(e);
    }
}
/**
 * execute mothed.
 *
 * @api private
 */
function clientExecute(){
    if (clientConnected){
        client.execute.apply(client, arguments);
    } else {
        console.log('请先建立与daemon的socket连接');
    }
}

/**
 * disconnect from socket client.
 *
 * @api private
 */
function clientDisconnect(){
    client.disconnect();
}
