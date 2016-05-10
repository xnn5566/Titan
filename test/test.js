// 下面是测试
var Titan = require('../index.js');

Titan.start({
    'name' : 'myTitan',
    'entrance' : 'index.js',
    'worker_count' : 0,
    'args' : '--harmony'
},function (){
    // CLI.test();
})
