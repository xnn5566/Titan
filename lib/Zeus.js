var cluster = require('cluster');
var p = require('path');

var EventProtocol = require('./EventProtocol');
var cst = require('../Constants');

/**
 * AppDatabase.
 * Zeus 内部的 app 数据存储
 */
var AppDatabase = {}

/**
 * Zeus.
 * Daemon 对外暴露的所有 API
 */
var Zeus = module.exports = {};

/**
 * start app with Cfg.
 *
 * @param {JSON} config
 * @api public
 */
Zeus.startAppWithCfg = function (config){
    var ts =+ new Date;
    // appName 不存在就生成一个新的
    config.name = config.name != undefined ? config.name : 'Titan' + ts.toString();
    config.start_time = ts;
    var app = AppDatabase[config.name];
    if (!app){
        // 如果 这个 app 不存在就添加新的 app 进 database
        // 下面是 app 的数据结构
        app = AppDatabase[config.name] = {
            workers       : [],
            config        : config,
            lastStartTime : ts
        };
    } else {
        // 如果 app 存在
        // 就把 config 和 lastStartTime 修改成新的
        app.config = config;
        app.lastStartTime = ts;
    }
    // 然后启动他
    return Zeus.startAppWithName(app.config.name);
}

/**
 * start app with name.
 *
 * @param {String} appName
 * @return {Boolen} boolen
 * @api public
 */
Zeus.startAppWithName = function(appName) {
    var config = AppDatabase[appName].config;
    // 解析入口文件路径
    var entranceJS = p.resolve(p.dirname(module.filename), 'WorkerEntrance.js');
    // var entranceJS = p.resolve(config.entrance_path, config.entrance);
    // 修改 worker 的入口和参数
    cluster.setupMaster({
        exec : entranceJS,
        args : config.args.split(' ')
    });
    // worker 的数量
    var workerCount = config.worker_count;
    // 根据 workerCount 来启进程
    if (workerCount == undefined || workerCount == 0){
        // workerCount 不存在或者为 0
        // 都启 cpu 个数的 worker
        var workerCount = require('os').cpus().length;
    } else {
        // workerCount 存在
        workerCount = parseInt(workerCount);
    }
    // 真正开始启 worker
    var err = false; // 默认没有 error
    for (var i = 0; i < workerCount; i++){
        // worker
        var workerDb = AppDatabase[appName].workers[i];
        if ( workerDb == undefined || workerDb.status != cst.ONLINE_STATUS){
            // worker 不存在存在 或者 状态不是 online

            // 出错的话 之后加错误处理吧
            // 重启、打 log 之类的
            try {
                var worker = startWorkerWithId(appName, i);
                // 将 worker 被 EventProtocol 包裹一下
                EventProtocol.wrapProcess(worker, global._event);
            }
            catch (e) {
                console.log('启动 worker 时出错，appname：' + appName, e)
                err = e;
            }
        }
    }
    return err;
}

/**
 * start app with name.
 *
 * @param {String} appName
 * @param {Num} id
 * @return {Object} worker
 * @api public
 */
Zeus.getWorkerByAppInfo = function(appName, id){
    return getWorker(AppDatabase[appName].workers[id].workerId);
}

/**
 * kill daemon
 * @return {[type]} [description]
 */
Zeus.killDaemon = function() {
    console.log('我是daemon kill');
    process.exit(0);
};


/**
 * list workers
 * @return {[type]} [description]
 */
Zeus.list = function() {

};

/**
 * logs
 * @return {[type]} [description]
 */
Zeus.logs = function() {

};

/**
 * monit workers
 * @return {[type]} [description]
 */
Zeus.monit = function() {

};


/**
 * get real worker.
 *
 * @param {String} workerId
 * @return {Object} worker
 * @api private
 */
function getWorker(workerId){
    return cluster.wokers[workerId];
}

/**
 * start worker.
 *
 * @param {String} appName
 * @param {num} id
 * @return {Boolen} boolen
 * @api private
 */
function startWorkerWithId (appName, id){
    var config = AppDatabase[appName].config;
    // 需要给 worker 注入的 TITAN_ENV
    var titan_env = {
        DB_NAME         : appName,//database 里 app 名称
        DB_ID           : id,// database 里 id
        APP_ENTRANCE_JS : p.resolve(config.entrance_path, config.entrance) // 真正的 app 的入口
    }
    // 用 cluster fork 来起 worker
    var newWorker = cluster.fork({TITAN_ENV: JSON.stringify(titan_env)}); // worker id

    var ts =+ new Date;
    var workerDb = AppDatabase[appName].workers[id];
    if (!workerDb){
        // 如果此 worker 不存在
        // 定义新的 worker 的数据结构
        var workerWrap = {
            workerId      : newWorker.id, // 在 cluster.workers 里的索引
            name          : appName + id.toString(), // worker 名称
            status        : cst.LAUNCHING_STATUS, // worker 状态
            restartCount  : 0, // worker 重启次数
            lastStartTime : ts
        }
        // 并把新 worker 丢到 database 里
        AppDatabase[appName].workers.push(workerWrap);
    } else {
        // 此 woker 存在
        workerDb.status = cst.LAUNCHING_STATUS; // 重置 worker 状态
        workerDb.restartCount++; // 增加 worker 重启次数
        workerDb.lastStartTime = ts; // 重新设置 上次启动时间
    }
    return workerEventHandle(newWorker, appName, id);
}

/**
 * worker event handle.
 *
 * @param {Object} worker
 * @return {Object} worker
 * @api private
 */
function workerEventHandle(worker, appName, id){
    var workerDb = AppDatabase[appName].workers[id];
    // worker 真正启动以后会触发 online
    worker.on('online', function (){
        console.log(worker.id + ': online');
        workerDb.status = cst.ONLINE_STATUS; // online
    })

    // 理论上 应该先触发 disconnect 再 触发 exit 事件
    worker.on('disconnect', function() {
        console.log('worker ' + worker.id + ' 尝试断开连接');
        workerDb.status = cst.STOPPING_STATUS; // stoppong
    });

    worker.on('exit', function(code, signal) {
        if (signal) {
            console.log("worker被信号 " + signal + " 杀掉了");
            workerDb.status = cst.OFFLINE_STATUS; // offline
        } else if( code !== 0 ) {
            console.log("worker进程退出，错误码：" + code);
            workerDb.status = cst.ERRORED_STATUS; // error
        } else {
            console.log("劳动者的胜利！");
            workerDb.status = cst.OFFLINE_STATUS; // offline
        }
    });

    return worker;
}
