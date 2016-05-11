// 下面是测试
var Titan = require('../index.js');

Titan.start({
    'name' : 'myTitan',
    'entrance' : 'index.js',
    'worker_count' : 1,
    'args' : '--harmony'
},function (){
    // CLI.test();
})

// require('./index.js')
