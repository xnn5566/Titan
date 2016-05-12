var p = require('path');
var fs = require('fs');
var chalk = require('chalk');

// 定位 Titan 的运行目录
var ROOTPATH = '';
if (process.env.TITAN_ROOT_PATH) {
    ROOTPATH = process.env.TITAN_ROOT_PATH;
} else if (process.env.HOME) {
    ROOTPATH = p.resolve(process.env.HOME, '.titan');
} else {
    ROOTPATH = p.resolve('/etc', '.titan');
}

var Constants = {
    ROOT_PATH          : ROOTPATH,
    
    // process status
    ONLINE_STATUS      : 'online',
    OFFLINE_STATUS     : 'offline',
    STOPPING_STATUS    : 'stopping',
    LAUNCHING_STATUS   : 'launching',
    ERRORED_STATUS     : 'errored',

    // log prefix
    PREFIX_INFO     : chalk.green('[TITAN]'),
    PREFIX_ERROR    : chalk.red('[TITAN][ERROR]'),
    PREFIX_WARN     : chalk.yellow('[TITAN][WARN]'),

    // daemon home path file
    DAEMON_PID_PATH    : p.resolve(ROOTPATH, 'titan.pid'),
    DAEMON_PRO_PORT    : p.resolve(ROOTPATH, 'protocol.sock')
}

// windows 平台 处理
if (process.platform === 'win32' ||process.platform === 'win64') {
    Constants.TITAN_HOME = p.resolve(process.env.HOMEDRIVE, process.env.HOMEPATH, '.titan');
    Constants.DAEMON_PID_PATH = p.resolve(Constants.TITAN_HOME, 'titan.pid'),
    Constants.DAEMON_PRO_PORT = '\\\\.\\pipe\\protocol.sock';
}

module.exports = Constants;
