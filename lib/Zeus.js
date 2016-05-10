var cluster = require('cluster');
var p = require('path');

var Zeus = module.exports = {};

Zeus.startApp = function (config){
    var entranceJS = p.resolve(config.entrance_path, config.entrance);
    cluster.setupMaster({
        exec : entranceJS,
        args : ['--harmony']
    });
    cluster.fork();
    cluster.fork();
    return true;
}
