
var net = require('net');
var p = require('path');
var util = require('util');
var fs = require('fs');

var cst = require('../Constants');
var SocketClient = require('./SocketClient');

var client = new SocketClient();
var clientConnected = false;
var daemonIsAlive = false;

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
Titan.pingDaemon = function(callback){
    if (daemonIsAlive){
        return callback(true);
    }
    var nativeClient = new net.Socket();

    nativeClient.once('error', function(error) {
        process.nextTick(function() {
            return callback(false);
        });
    });

    nativeClient.once('connect', function() {
        nativeClient.once('close', function() {
            daemonIsAlive = true;
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
 * @api publick
 */
Titan.bootDaemon = function(callback){
    console.log('Daemon start');
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
            console.log('Daemon start ok');
        } else {
            err = msg;
        }
        callback(err);
    });
    console.log('Daemon pid : ' + child.pid);
}


/**
 * connect to daemon.
 *
 * @param {Function} callback
 */
Titan.connectDaemon = function (callback){
    if (clientConnected){
        callback();
    }
    try {
        client.connect(cst.DAEMON_PRO_PORT, function (){
            clientConnected = true;
            callback();
        });
    } catch (e){
        console.err(e);
    }
}

/**
 * kill daemon.
 *
 * @param {Function} callback
 * @api public
 */
Titan.killDaemon = function (callback) {
    client.socket.on('end', function(){
        console.log('kill Daemon success');
        return callback();
    });
    executeZeusMothed('killDaemon');
}

/**
 * start app.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
Titan.startApp = function (config, callback){
    executeZeusMothed('startAppWithCfg', util._extend({}, config), callback);
}

/**
 * execute mothed.
 *
 * @api public
 */
Titan.executeMothed = function () {
    executeZeusMothed.apply(null, arguments);
}

/**
 * disconnect from Daemon.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
 Titan.disconnectDaemon = function (){
     if (clientConnected){
         clientConnected = false;
         client.disconnect();
     }
 }

/**
 * execute mothed.
 *
 * @api private
 */
function executeZeusMothed(){
    if (clientConnected){
        client.execute.apply(client, arguments);
    } else {
        console.warn('请先建立与daemon的socket连接');
    }
}
