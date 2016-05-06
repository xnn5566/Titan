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
    ROOT_PATH : ROOTPATH,

    DAEMON_PID_PATH : p.resolve(ROOTPATH, 'titan.pid'),
    DAEMON_BUS_PORT : p.resolve(ROOTPATH, 'bus.sock')
}

// windows 平台 处理
if (process.platform === 'win32' ||process.platform === 'win64') {
    Constants.TITAN_HOME = p.resolve(process.env.HOMEDRIVE, process.env.HOMEPATH, '.titan');
    Constants.DAEMON_PID_PATH = p.resolve(Constants.TITAN_HOME, 'daemon.pid'),
    Constants.DAEMON_RPC_PORT = '\\\\.\\pipe\\rpc.sock';
    Constants.DAEMON_PUB_PORT = '\\\\.\\pipe\\pub.sock';
}

module.exports = Constants;
