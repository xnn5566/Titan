var CLI = require('./lib/CLI.js');

CLI.init();

// 下面是测试
CLI.start(function (){
    CLI.test();
})

module.exports = CLI;
