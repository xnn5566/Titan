
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
 *@param {Function} callback
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
 * @param {String} appName
 * @param {Function} callback
 * @api public
 */
CLI.startAppWithName = function (appName, callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('startAppWithName', appName, function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('App \'' + appName + '\' start success');
            }
            callback && callback(err, msg);
        });
    });
}


/**
 * start all apps.
 *
 * @param {Function} callback
 * @api public
 */
CLI.startAppAll = function (callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('startAppAll', function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('All app start success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * stop app with name.
 *
 * @param {String} appName
 * @param {Function} callback
 * @api public
 */
CLI.stopAppWithName = function (appName, callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('stopAppWithName', appName, function (err, msg){
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
 * stop all apps.
 *
 * @param {Function} callback
 * @api public
 */
CLI.stopAppAll = function (callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('stopAppAll', function (err, msg){
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
 * restart app with name.
 *
 * @param {String} appName
 * @param {Function} callback
 * @api public
 */
CLI.restartAppWithName = function (appName, callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('restartAppWithName', appName, function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('App \'' + appName + '\' restart success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * restart all apps.
 *
 * @param {Function} callback
 * @api public
 */
CLI.restartAppAll = function (callback){
    tryToConnectDaemon(function (){
        Titan.executeMothed('restartAppAll', function (err, msg){
            if (err){
                console.log(msg);
            } else {
                console.log('All app restart success');
            }
            callback && callback(err, msg);
        });
    });
}

/**
 * try to connect daemon.
 *
 * @param {Function} callback
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
