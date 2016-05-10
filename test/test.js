// 下面是测试
var Titan = require('../index.js');

Titan.start({
    'name' : 'myTitan',
    'entrance' : 'index.js',
    'cluster_count' : 0,
},function (){
    // CLI.test();
})
