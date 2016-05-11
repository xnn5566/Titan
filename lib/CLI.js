
var p = require('path');
var fs = require('fs');

var cst = require('../Constants');
var Titan = require('./Titan');

var CLI = module.exports = {};

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

CLI.start = function (config, callback){
    // console.log(module.parent.parent.filename)
    config.entrance_path = p.dirname(module.parent.parent.filename);
    Titan.connectDaemon(function (){
        Titan.startApp(config, callback)
    });
}


CLI.kill = function (){
    Titan.connectDaemon(function (){
        Titan.killDaemon(function(){
            console.log('killDaemon 的回调函数');
        })
    });
}

CLI.disconnect = Titan.disconnect;



// CLI.test = Titan.test;
