'use strict';

var _types = require('./types');

var _utils = require('./utils');

module.exports = function createPluginService(Context) {
    var selectors = (0, _utils.obj)();
    var processors = (0, _utils.obj)();
    var cached = (0, _utils.obj)();
    var post_names = (0, _utils.obj)();
    var indexes = [];

    Context = (0, _utils.getFn)(Context);

    function inject(name, processor, fn) {
        if (selectors[name]) {
            return function (payload) {
                var ctx = new Context(payload);
                return selectors[name].call(ctx, payload, (0, _utils.getFn)(fn, payload));
            };
        } else {
            return function (payload) {
                var ctx = new Context(payload);
                return processor.call(ctx, payload, (0, _utils.getFn)(fn, payload));
            };
        }
    }

    function process(name, processor) {
        if ((0, _types.isObj)(name)) {
            (0, _utils.each)(name, function (processor, key) {
                process(key, processor);
            });
        } else {

            name = (0, _utils.lowerCase)(name);

            if (!(0, _types.isFn)(processor)) return;

            if (!processors[name]) {
                indexes.push(name);
            }
            processors[name] = inject(name, processor, processors[name]);
        }
    }

    function remove(name) {
        var processor = processors[name];
        delete processor[name];
        return processor;
    }

    function guard(name, selector) {
        if ((0, _types.isStr)(name) && (0, _types.isFn)(selector)) {
            if (!(0, _utils.hasOwn)(selectors, name)) {
                selectors[name] = selector;
            }
        } else {
            (0, _utils.each)(name, function (selector, name) {
                guard(name, selector);
            });
        }
    }

    function getProcessor(name) {
        name = (0, _utils.lowerCase)(name);
        return processors[name] || processors['process' + name];
    }

    function parsePath(path) {
        if (!post_names[path]) {
            post_names[path] = {
                name: ((0, _types.isArr)(path) ? path : path.split(',')).filter(function (name) {
                    return getProcessor(name);
                })
            };
            post_names[path].path = post_names[path].name.join(',');
        }
        return post_names[path];
    }

    function post(path, payload, defaults) {
        if ((0, _types.isStr)(path)) {
            var parsed = parsePath(path);
            var name = parsed.name;
            var new_path = parsed.path;
            if (name.length) {
                processors[new_path] = processors[new_path] || _utils.compose.apply(null, name.map(function (name) {
                    return getProcessor(name);
                }));
                if ((0, _types.isFn)(processors[new_path])) {
                    return processors[new_path](payload);
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

    function all(payload) {
        return (0, _utils.isValid)(payload) && (0, _utils.reduce)(indexes, function (payload, name) {
            return post(name, payload);
        }, payload);
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
        guard: guard,
        process: process,
        remove: remove,
        post: post,
        extension: extension,
        cache: cache,
        all: all
    };

    Context.prototype = (0, _utils.extend)(Context.prototype, api);

    return api;
};