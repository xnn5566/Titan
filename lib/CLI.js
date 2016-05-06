var CLI = module.exports = {};

var fs = require('fs');

var cst = require('../Constants');
var light = require('./light');

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
