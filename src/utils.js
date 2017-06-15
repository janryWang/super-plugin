'use strict'
import {
    isFn,
    isArr,
    isObj,
    isIter,
    isNum,
    isStr
} from './types'

export const noop = defaults => () => defaults

export const getFn = (fn, defaults) => isFn(fn) ? fn : noop(defaults)

export const getStr = str => isStr(str) ? str : ''

export const obj = () => Object.create(null)

export const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export const isValid = value => value !== undefined && value !== null

export const isValidThen = (left, right) => isValid(left) ? left : right

export const extend = (to, _from) => {
    for (const key in _from) {
        to[key] = _from[key]
    }
    return to
}


export const each = (target, fn) => {
    if (!isFn(fn)) return
    if (isArr(target)) {
        for (let i = 0, len = target.length; i < len; i++) {
            if (fn(target[i], i) === false) {
                break
            }
        }

    } else {
        for (let key in target) {
            if (hasOwn(target, key)) {
                if (fn(target[key], key) === false) {
                    break
                }
            }
        }
    }
}





export const lowerCase = (str) => {
    return getStr(str).toLowerCase()
}

