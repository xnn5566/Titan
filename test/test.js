// 下面是测试
var pmt = require('../index.js');

pmt.start({
    'name' : 'myTitan',
    'entrance' : 'index.js',
    'worker_count' : 1,
    'args' : '--harmony'
},function (){
    pmt.disconnect();
})

// require('./index.js')
