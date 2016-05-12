
var p = require('path');
var fs = require('fs');

var cst = require('../Constants');
var Titan = require('./Titan');

require('./console');
var CLI = module.exports = {};
/**
 * CLI init.
 *
 * @api public
 */
CLI.init = function (){
    try {
        // 先检测 rootpath 是否存在
        // 不存在则创建
        if (!fs.existsSync(cst.ROOT_PATH)) {
            fs.mkdirSync(cst.ROOT_PATH);
        }
    } catch (e) {
        console.error(e.stack || e);
    }
}

/**
 * disconnect from daemon.
 *
 * @api public
 */
CLI.disconnect = Titan.disconnectDaemon;

/**
 * start app by config.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
CLI.start = function (config, callback){
    // 向 config 里注入 入口路径
    config.entrance_path = p.dirname(module.parent.parent.filename);

    Titan.pingDaemon(function (isOk){
        if(isOk){
            Titan.connectDaemon(start);
        } else {
            Titan.bootDaemon(function (){
                Titan.connectDaemon(start);
            });
        }
    });

    function start(){
        Titan.startApp(config, function (err, msg){
            if (err){
                console.log(msg);
                callback && callback(err, msg);
            } else {
                console.log('Start app \'' + config.name + '\' success');
                callback && callback(false);
            }
        });

    }
}

/**
 * kill daemon.
 *
 * @api public
 */
CLI.kill = function (callback){
    tryToConnectDaemon(function (){
        Titan.killDaemon(callback);
    });
}

/**
 * start app with name.
 *
 * @api public
 */
CLI.startAppWithName = function (appName, callback){
    tryToConnectDaemon(function (){
        Titan.startAppWithName(appName, function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('App \'' + appName + '\' stop success');
            }
            callback && callback(err, msg);
        });
    });
}


/**
 * stop app with name.
 *
 * @api public
 */
CLI.startAppAll = function (callback){
    tryToConnectDaemon(function (){
        Titan.startAppAll(function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('All app stop success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * stop app with name.
 *
 * @api public
 */
CLI.stopAppWithName = function (appName, callback){
    tryToConnectDaemon(function (){
        Titan.stopAppWithName(appName, function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('App \'' + appName + '\' stop success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * stop app with name.
 *
 * @api public
 */
CLI.stopAppAll = function (callback){
    tryToConnectDaemon(function (){
        Titan.stopAppAll(function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('All app stop success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * try to connect daemon.
 *
 * @api private
 */
function tryToConnectDaemon(callback){
    // 先验证 daemon 是否存在
    Titan.pingDaemon(function (isOk){
        if (isOk){
            Titan.connectDaemon(callback);
        } else {
            console.warn('Titan Daemon doesn\'t exist');
        }
    });
}
