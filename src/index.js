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
    obj,
    isValid,
    isValidThen,
    lowerCase
} from './utils'




export function createPluginService(Context) {
    const processors = obj()
    const cacheName = obj()
    Context = Context || noop()

    function inject(name, processor, fn) {
        return (payload) => {
            const ctx = new Context(payload)
            const previous = getFn(fn, payload)
            if(isFn(ctx.beforeEach)) ctx.beforeEach(payload)
            const result = processor.call(ctx, payload, previous)
            if(isFn(ctx.afterEach)) ctx.afterEach(result)
            return result
        }
    }

    function getProcessName(name){
        if(cacheName[name]) return cacheName[name]
        cacheName[name] = lowerCase(name).replace(/process/i, '')
        return cacheName[name]
    }

    function process(name, processor) {
        if (isObj(name)) {
            each(name, (processor, key) => {
                process(key, processor)
            })
        } else {

            name = getProcessName(name)

            if (!isFn(processor)) return

            processors[name] = inject(
                name,
                processor,
                processors[name]
            )

        }
    }

    function post(name, payload, defaults) {
        if (isStr(name)) {
            if (name.length) {
                 name = getProcessName(name)
                if (isFn(processors[name])) {
                    return processors[name](payload)
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
        process,
        post,
        extension,
        cache
    }

    Context.prototype = extend(Context.prototype, api)

    return api

}