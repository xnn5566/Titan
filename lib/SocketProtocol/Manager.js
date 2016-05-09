// socket 协议管理器
var SPManager = module.exports = function (){
    this.n = 0;
    this.methods = {};
    this.callbacks = {};
}

/**
 * add method.
 *
 * @param {String} methodName
 * @param {Function} method
 * @api public
 */
SPManager.prototype.addMethod = function (methodName, method){
    this.methods[methodName] = method;
}

/**
 * add callback.
 *
 * @param {Function} callback
 * @api public
 */
SPManager.prototype.addCallback = function (callback){
    var callbackId = 'callback' + (this.n++).toString();
    this.callbacks[callbackId] = callback;
    return callbackId;
}

/**
 * add callback.
 *
 * @param {Function} callback
 * @api public
 */
SPManager.prototype.execute = function (methodName, args){
    // 如果 methods 里有就执行
    // 然后再去 callbacks 找
    // callbacks 里有就执行了，然后从 callbacks 里删了
    // callbacks 也没有就傻逼了
    if (this.methods[methodName]){
        return this.methods[methodName].apply(null, args);
    }

    if (this.callbacks[methodName]){
        var returnData = this.callbacks[methodName].apply(null, args);
        delete this.callbacks[methodName];
        return returnData;
    }

    console.log('没找到叫' + methodName + '的方法');
    return 'No method called ' + methodName;

}
