var p = require('path');

console.log('这里应该子进程');
process.title = 'asdf';
var i = 0;
setInterval(function (){
    i++;
}, 1000);
process.send({ foo: 'bar' });
