
var p = require('path');
var fs = require('fs');

var cst = require('../Constants');
var Titan = require('./Titan');

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
 * start app by config.
 *
 * @param {Object} config
 * @param {Function} callback
 * @api public
 */
CLI.start = function (config, callback){
    // 向 config 里注入 入口路径
    config.entrance_path = p.dirname(module.parent.parent.filename);
    tryToConnectDaemon(function (){
        Titan.startApp(config, callback);
        console.log('start app 成功');
    });
}

/**
 * kill daemon.
 *
 * @api public
 */
CLI.kill = function (){
    // 先验证 daemon 是否存在
    // 不存在就不用 kill
    // 存在再去 kill
    Titan.pingDaemon(function (isOk){
        if (isOk){
            Titan.connectDaemon(function (){
                Titan.killDaemon(function(){
                    console.log('成功 kill Daemon');
                });
            })
        } else {
            console.log('Daemon 不存在无法 kill');
        }
    });
}

/**
 * disconnect from daemon.
 *
 * @api public
 */
CLI.disconnect = Titan.disconnectDaemon;

/**
 * try to connect daemon.
 *
 * @api private
 */
function tryToConnectDaemon(callback){
    // 先验证
    Titan.pingDaemon(function (isOk){
        if(isOk){
            Titan.connectDaemon(callback);
        } else {
            Titan.bootDaemon(function (){
                Titan.connectDaemon(callback);
            })
        }
    })
}
