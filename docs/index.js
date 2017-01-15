(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

var isType = function (type) { return function (obj) { return obj != null && Object.prototype.toString.call(obj) === ("[object " + type + "]"); }; }
var isFn = isType('Function')
var isArr = Array.isArray || isType('Array')
var isObj = isType('Object')
var isStr = isType('String')

var noop = function (defaults) { return function () { return defaults; }; }

var getFn = function (fn, defaults) { return isFn(fn) ? fn : noop(defaults); }

var getStr = function (str) { return isStr(str) ? str : ''; }

var obj = function () { return Object.create(null); }

var hasOwnProperty = Object.prototype.hasOwnProperty

var hasOwn = function (target, key) { return hasOwnProperty.call(target, key); }

var isValid = function (value) { return value !== undefined && value !== null; }

var isValidThen = function (left, right) { return isValid(left) ? left : right; }

var extend = function (to, _from) {
    for (var key in _from) {
        to[key] = _from[key]
    }
    return to
}


var each = function (target, fn) {
    if (!isFn(fn)) return
    if (isArr(target)) {
        for (var i = 0, len = target.length; i < len; i++) {
            if (fn(target[i], i) === false) {
                break
            }
        }

    } else {
        for (var key in target) {
            if (hasOwn(target, key)) {
                if (fn(target[key], key) === false) {
                    break
                }
            }
        }
    }
}



var reduce = function (target, fn, init) {
    if (!isFn(fn)) return
    if (isArr(target)) return target.reduce(fn, init)
    else {
        var result = init
        each(target, function (value, key) {
            result = fn(result, value, key)
        })
        return result
    }
}

var compose = function () {
    var fns = [], len = arguments.length;
    while ( len-- ) fns[ len ] = arguments[ len ];

    return function (payload) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

        return reduce(fns, function (buf, fn) {
        return getFn(fn).apply(void 0, [ buf ].concat( args ))
    }, payload);
    }
}


var lowerCase = function (str) {
    return getStr(str).toLowerCase()
}

module.exports = function createPluginService(Context) {
    var selectors = obj()
    var processors = obj()
    var cached = obj()
    var post_names = obj()
    var indexes = []

    Context = getFn(Context)

    function inject(name, processor, fn) {
        if (selectors[name]) {
            return function (payload) {
                var ctx = new Context(payload)
                return selectors[name].call(ctx, payload, getFn(fn, payload))
            }
        } else {
            return function (payload) {
                var ctx = new Context(payload)
                return processor.call(ctx, payload, getFn(fn, payload))
            }
        }
    }

    function process(name, processor) {
        if (isObj(name)) {
            each(name, function (processor, key) {
                process(key, processor)
            })
        } else {

            name = lowerCase(processors[name] ? name : processors['process' + name] ? 'process' + name : name)

            if (!isFn(processor)) return

            if (!processors[name]) {
                indexes.push(name)
            }
            processors[name] = inject(
                name,
                processor,
                processors[name]
            )

        }
    }

    function remove(name) {
        var processor = processors[name]
        delete processor[name]
        return processor
    }

    function guard(name, selector) {
        if (isStr(name) && isFn(selector)) {
            if (!hasOwn(selectors, name)) {
                selectors[name] = selector
            }
        } else {
            each(name, function (selector, name) {
                guard(name, selector)
            })
        }
    }

    function getProcessor(name) {
        name = lowerCase(name)
        return processors[name] || processors['process' + name]
    }

    function parsePath(path) {
        if (!post_names[path]) {
            post_names[path] = {
                name: (isArr(path) ? path : path.split(',')).filter(function (name) { return getProcessor(name); })
            }
            post_names[path].path = post_names[path].name.join(',')
        }
        return post_names[path]
    }

    function post(path, payload, defaults) {
        if (isStr(path)) {
            var parsed = parsePath(path)
            var name = parsed.name
            var new_path = parsed.path
            if (name.length) {
                processors[new_path] = processors[new_path] || compose.apply(null, name.map(function (name) { return getProcessor(name); }))
                if (isFn(processors[new_path])) {
                    return processors[new_path](payload)
                }
            }
        }
        return isValidThen(defaults, payload)
    }

    function cache(name, value) {
        if (isValid(value)) {
            cached[name] = value
        } else {
            return cached[name]
        }
    }

    function all(payload) {
        return isValid(payload) && reduce(indexes, function (payload, name) {
            return post(name, payload)
        }, payload)
    }

    function extension(exts) {
        if (isArr(exts)) {
            each(exts, function (ext) { return extension(ext); })
        } else if (isFn(exts)) {
            exts(api)
        } else {
            process(exts)
        }
    }

    var api = {
        guard: guard,
        process: process,
        remove: remove,
        post: post,
        extension: extension,
        cache: cache,
        all: all
    }

    Context.prototype = extend(Context.prototype, api)

    return api
}

})));