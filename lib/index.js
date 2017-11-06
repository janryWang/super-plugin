'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPluginService = createPluginService;

var _types = require('./types');

var _utils = require('./utils');

function createPluginService(Context) {
    var processors = (0, _utils.obj)();
    var cacheName = (0, _utils.obj)();
    Context = Context || (0, _utils.noop)();

    function inject(name, processor, fn) {
        return function (payload) {
            var ctx = new Context(payload);
            var previous = (0, _utils.getFn)(fn, payload);
            if ((0, _types.isFn)(ctx._beforeProcess)) ctx._beforeProcess(payload);
            var result = processor.call(ctx, payload, previous);
            if ((0, _types.isFn)(ctx._afterProcess)) ctx._afterProcess(result);
            return result;
        };
    }

    function getProcessName(name) {
        if (cacheName[name]) return cacheName[name];
        cacheName[name] = (0, _utils.lowerCase)(name).replace(/process/i, '');
        return cacheName[name];
    }

    function process(name, processor) {
        if ((0, _types.isObj)(name)) {
            (0, _utils.each)(name, function (processor, key) {
                process(key, processor);
            });
        } else {

            name = getProcessName(name);

            if (!(0, _types.isFn)(processor)) return;

            processors[name] = inject(name, processor, processors[name]);
        }
    }

    function post(name, payload, defaults) {
        if ((0, _types.isStr)(name)) {
            if (name.length) {
                name = getProcessName(name);
                if ((0, _types.isFn)(processors[name])) {
                    return processors[name](payload);
                }
            }
        }
        return (0, _utils.isValidThen)(defaults, payload);
    }

    function cache(name, value) {
        if ((0, _utils.isValid)(value)) {
            cached[name] = value;
        } else {
            return cached[name];
        }
    }

    function extension(exts) {
        if ((0, _types.isArr)(exts)) {
            (0, _utils.each)(exts, function (ext) {
                return extension(ext);
            });
        } else if ((0, _types.isFn)(exts)) {
            exts(api);
        } else {
            process(exts);
        }
    }

    var api = {
        process: process,
        post: post,
        extension: extension,
        cache: cache
    };

    Context.prototype = (0, _utils.extend)(Context.prototype, api);

    return api;
}