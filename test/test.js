// 下面是测试
var pmt = require('../index.js');

pmt.start({
    'name'         : 'myTitan',
    'entrance'     : 'index.js',
    'worker_count' : 2,
    'args'         : '--harmony',
    'max_momery'   : '10' // 单位 MB
},function (){
    pmt.disconnect();
})

// require('./index.js')
