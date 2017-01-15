'use strict'

export const isType = type => obj => obj != null && Object.prototype.toString.call(obj) === `[object ${ type }]`
export const isFn = isType('Function')
export const isArr = Array.isArray || isType('Array')
export const isObj = isType('Object')
export const isStr = isType('String')
export const isNum = isType('Number')
export const isIter = obj => (isArr(obj) || isObj(obj))