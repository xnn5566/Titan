var cluster = require('cluster');
var p = require('path');

/**
 * ClusterDatabase.
 * Zeus 内部的 cluster 数据存储
 */
var ClusterDatabase = {
    apps: {},
    appCount: 0
}

/**
 * Zeus.
 * Daemon 对外暴露的所有 API
 */
var Zeus = module.exports = {};

/**
 * start app.
 *
 * @param {JSON} config
 * @api public
 */
Zeus.startApp = function (config){
    var appName = config.name;

    if (getApp(appName)){
        // 如果此 App 存在
    } else {
        // 如果此 App 不存在
        appName = 'Titan' + ClusterDatabase.appCount++;
    }

    var entranceJS = p.resolve(config.entrance_path, config.entrance);
    cluster.setupMaster({
        exec : entranceJS,
        args : ['--harmony']
    });
    if (config.cluster_count && config.cluster_count != 0){

    } else {
        var n = parseInt(config.cluster_count);
        for (var i = 0; i < n; i++){
            var childTemp = cluster.fork();
            var childName = config.name ? config.name : ('Titan' + ClusterDatabase.appCount++);
            Zeus.ClusterDatabase[childName]
        }
    }
    return true;
}

function getApp = function (appName){
    return ClusterDatabase.app[appName];
}
