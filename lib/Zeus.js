var cluster = require('cluster');
var p = require('path');

var EventProtocol = require('./EventProtocol');
var cst = require('../Constants');

/**
 * AppDatabase.
 * Zeus 内部的 app 数据存储
 */
var AppDatabase = {};

/**
 * AppCount.
 */
var AppCount = 0;

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
Zeus.startAppWithCfg = function (config, callback){
    var ts =+ new Date;
    // appName 不存在就生成一个新的
    config.name = config.name != undefined ? config.name : 'Titan' + ts.toString();
    config.args && (config.args = config.args.split(' '));
    config.start_time = ts;
    var app = AppDatabase[config.name];
    if (!app){
        // 如果 这个 app 不存在就添加新的 app 进 database
        // 下面是 app 的数据结构
        AppCount++;
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
    Zeus.startAppWithName(app.config.name, callback);
}

/**
 * start app with name.
 *
 * @param {String} appName
 * @api public
 */
Zeus.startAppWithName = function(appName, callback) {
    console.log('App \'' + appName + '\' is ready to start');
    var app = AppDatabase[appName];
    if (app == undefined){
        callback && callback(true, 'no app called \'' + appName + '\'');
        return;
    }
    var config = AppDatabase[appName].config;
    // 解析入口文件路径
    var entranceJS = p.resolve(p.dirname(module.filename), 'WorkerEntrance.js');
    // var entranceJS = p.resolve(config.entrance_path, config.entrance);
    // 修改 worker 的入口和参数
    cluster.setupMaster({
        exec : entranceJS,
        args : config.args
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
    var err = false, msg;
    for (var i = 0; i < workerCount; i++){
        // worker
        var workerDb = AppDatabase[appName].workers[i];
        if (workerDb == undefined || workerDb.status != cst.ONLINE_STATUS){
            // worker 不存在存在 或者 状态不是 online

            // 出错的话 之后加错误处理吧
            // 重启、打 log 之类的
            try {
                var worker = startWorkerWithId(appName, i);
                // 将 worker 被 EventProtocol 包裹一下
                EventProtocol.wrapProcess(worker.process, global._event);
            }
            catch (e) {
                console.error(appName + ' 启动 worker 时出错\n' + e);
                err = true;
                msg = e.name + ' : ' + e.message;
            }
        }
    }
    callback && callback(err, msg);
}

/**
 * stop all apps
 * @param {Function} callback
 */
Zeus.startAppAll = function (callback){
    if (AppCount === 0){
        // none app
        callback && callback(true, 'No apps to start');
        return;
    } else {
        var doCount = 0;
        for (var appName in AppDatabase){
            var err = false, msgAll = '';
            Zeus.startAppWithName(appName, function (err, msg){
                if (err) {
                    err = true;
                    msgAll += (msg + '\n');
                }
                doCount++;
                if (doCount === AppCount){
                    if (msgAll == ''){
                        callback && callback(err);
                    } else {
                        callback && callback(err, msgAll.substr(0, msgAll.length - 1));
                    }

                }
            });
        }
    }
}
/**
 * stop app by appName
 * @param {String} appName
 * @param {Function} callback
 */
Zeus.stopAppWithName = function(appName, callback) {
    var app = AppDatabase[appName];
    if (app == undefined){
        callback && callback(true, 'no app called \'' + appName + '\'');
        return;
    }
    var m = n = app.workers.length;
    for (var i = 0; i < n; i++){
        killWorkerWithId(appName, i, function (){
            m--;
            if (m === 0){
                callback && callback(false);
            }
        });
    }
};

/**
 * stop all apps
 * @param {Function} callback
 */
Zeus.stopAppAll = function (callback){
    if (AppCount === 0){
        // none app
        callback && callback(true, 'No apps to stop');
        return;
    } else {
        var doCount = 0;
        for (var appName in AppDatabase){
            Zeus.stopAppWithName(appName, function (){
                doCount++;
                if (doCount === AppCount){
                    callback && callback(false);
                }
            });
        }
    }
}

/**
 * kill daemon
 */
Zeus.killDaemon = function() {
    process.nextTick(function (){
        process.exit(0);
    });
};

/**
 * start worker.
 *
 * @param {String} appName
 * @param {num} id
 * @api private
 */
function startWorkerWithId (appName, id, callback){
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
    if (workerDb == undefined){
        // 如果此 worker 不存在
        // 定义新的 worker 的数据结构
        var workerWrap = {
            workerId      : newWorker.id, // 在 cluster.workers 里的索引
            worker        : newWorker,
            name          : appName + id.toString(), // worker 名称
            status        : cst.LAUNCHING_STATUS, // worker 状态
            restartCount  : 0, // worker 重启次数
            lastStartTime : ts
        }
        // 并把新 worker 丢到 database 里
        AppDatabase[appName].workers.push(workerWrap);
    } else {
        // 此 woker 存在
        workerDb.worker = newWorker; // 重新设置 worker 对象
        workerDb.status = cst.LAUNCHING_STATUS; // 重置 worker 状态
        workerDb.restartCount++; // 增加 worker 重启次数
        workerDb.lastStartTime = ts; // 重新设置 上次启动时间
    }
    workerEventHandle(appName, id, newWorker);
    return newWorker;
}

/**
 * kill worker with workerId.
 *
 * @param {String} appName
 * @param {num} id
 * @param {Function} callback
 * @api private
 */
function killWorkerWithId (appName, id, callback){
    var workerDb = AppDatabase[appName].workers[id];
    var worker = workerDb.worker;
    // online
    if (workerDb.status === cst.ONLINE_STATUS){
        worker.once('exit', function (code, signal){
            callback && callback(true);
        });
        worker.disconnect();
        return;
    }
    // offline
    if (workerDb.status === cst.OFFLINE_STATUS){
        callback && callback(true);
        return;
    }
    // error
    if (workerDb.status === cst.ERRORED_STATUS){
        workerDb.status = cst.OFFLINE_STATUS;
        callback && callback(true);
        return;
    }
    // stopping
    if (workerDb.status === cst.STOPPING_STATUS){
        worker.once('exit', function (code, signal){
            callback && callback(true);
        });
        return;
    }
    // stopping
    if (workerDb.status === cst.LAUNCHING_STATUS){
        worker.once('online', function (){
            worker.once('exit', function (code, signal){
                callback && callback(true);
            });
        });
        return;
    }
    callback && callback(false);
}

/**
 * worker event handle.
 *
 * @param {Object} worker
 * @api private
 */
function workerEventHandle(appName, id, worker){
    var workerDb = AppDatabase[appName].workers[id];
    // worker 真正启动以后会触发 online
    var workerFrefix = 'Worker \'' + appName + id +  '\' ';
    worker.on('online', function (){
        console.log(workerFrefix + ': online');
        workerDb.status = cst.ONLINE_STATUS; // online
    })

    // 理论上 应该先触发 disconnect 再 触发 exit 事件
    worker.on('disconnect', function() {
        console.log(workerFrefix + ' try to disconnect');
        workerDb.status = cst.STOPPING_STATUS; // stoppong
    });

    worker.on('exit', function(code, signal) {
        if (signal) {
            console.log(workerFrefix +  'is killed by signal \'' + signal + '\'');
            workerDb.status = cst.OFFLINE_STATUS; // offline
        } else if( code !== 0 ) {
            console.log(workerFrefix + ' exit，exit code：' + code);
            workerDb.status = cst.ERRORED_STATUS; // error
        } else {
            console.log(workerFrefix + ' exit successfully');
            workerDb.status = cst.OFFLINE_STATUS; // offline
        }
    });
}
