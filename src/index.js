'use strict'

import {
    isFn,
    isStr,
    isArr,
    isObj
} from './types'

import {
    each,
    noop,
    extend,
    getFn,
    hasOwn,
    compose,
    reduce,
    obj,
    isValid,
    isValidThen,
    lowerCase
} from './utils'


module.exports = function createPluginService(Context) {
    let selectors = obj()
    let processors = obj()
    let cached = obj()
    let post_names = obj()
    let indexes = []

    Context = getFn(Context)

    function inject(name, processor, fn) {
        if (selectors[name]) {
            return (payload) => {
                const ctx = new Context(payload)
                return selectors[name].call(ctx, payload, getFn(fn, payload))
            }
        } else {
            return (payload) => {
                const ctx = new Context(payload)
                return processor.call(ctx, payload, getFn(fn, payload))
            }
        }
    }

    function process(name, processor) {
        if (isObj(name)) {
            each(name, (processor, key) => {
                process(key, processor)
            })
        } else {

            name = lowerCase(name)

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
        const processor = processors[name]
        delete processor[name]
        return processor
    }

    function guard(name, selector) {
        if (isStr(name) && isFn(selector)) {
            if (!hasOwn(selectors, name)) {
                selectors[name] = selector
            }
        } else {
            each(name, (selector, name) => {
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
                name: (isArr(path) ? path : path.split(',')).filter(name => getProcessor(name))
            }
            post_names[path].path = post_names[path].name.join(',')
        }
        return post_names[path]
    }

    function post(path, payload, defaults) {
        if (isStr(path)) {
            const parsed = parsePath(path)
            const name = parsed.name
            const new_path = parsed.path
            if (name.length) {
                processors[new_path] = processors[new_path] || compose.apply(null, name.map(name => getProcessor(name)))
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
        return isValid(payload) && reduce(indexes, (payload, name) => {
            return post(name, payload)
        }, payload)
    }

    function extension(exts) {
        if (isArr(exts)) {
            each(exts, ext => extension(ext))
        } else if (isFn(exts)) {
            exts(api)
        } else {
            process(exts)
        }
    }

    var api = {
        guard,
        process,
        remove,
        post,
        extension,
        cache,
        all
    }

    Context.prototype = extend(Context.prototype, api)

    return api
}
