var cst = require('../Constants');

/**
 * rewrite console log
 */
console.log = (function (nativeOut){
    return rewriteConsole(nativeOut, cst.PREFIX_INFO);
})(console.log);

/**
 * rewrite console error
 */
console.error = (function (nativeOut){
    return rewriteConsole(nativeOut, cst.PREFIX_ERROR);
})(console.error);

/**
 * rewrite console warn
 */
console.warn = (function (nativeOut){
    return rewriteConsole(nativeOut, cst.PREFIX_WARN);
})(console.warn);

/**
 * rewrite native output
 */
function rewriteConsole(nativeOut, prefix){
    return function (){
        var args = [prefix].concat([].slice.apply(arguments));

        // for (var i = 0; i < args.length; i++){
        //     if (typeof args[i] == 'string'){
        //         args[i].replace(/\\cJ/g, '\cJ' + prefix);
        //     }
        // }

        nativeOut.apply(console, args);
    }
}
