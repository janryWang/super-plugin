'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.lowerCase = exports.each = exports.extend = exports.isValidThen = exports.isValid = exports.hasOwn = exports.hasOwnProperty = exports.obj = exports.getStr = exports.getFn = exports.noop = undefined;

var _types = require('./types');

var noop = exports.noop = function noop(defaults) {
    return function () {
        return defaults;
    };
};

var getFn = exports.getFn = function getFn(fn, defaults) {
    return (0, _types.isFn)(fn) ? fn : noop(defaults);
};

var getStr = exports.getStr = function getStr(str) {
    return (0, _types.isStr)(str) ? str : '';
};

var obj = exports.obj = function obj() {
    return Object.create(null);
};

var hasOwnProperty = exports.hasOwnProperty = Object.prototype.hasOwnProperty;

var hasOwn = exports.hasOwn = function hasOwn(target, key) {
    return hasOwnProperty.call(target, key);
};

var isValid = exports.isValid = function isValid(value) {
    return value !== undefined && value !== null;
};

var isValidThen = exports.isValidThen = function isValidThen(left, right) {
    return isValid(left) ? left : right;
};

var extend = exports.extend = function extend(to, _from) {
    for (var key in _from) {
        to[key] = _from[key];
    }
    return to;
};

var each = exports.each = function each(target, fn) {
    if (!(0, _types.isFn)(fn)) return;
    if ((0, _types.isArr)(target)) {
        for (var i = 0, len = target.length; i < len; i++) {
            if (fn(target[i], i) === false) {
                break;
            }
        }
    } else {
        for (var key in target) {
            if (hasOwn(target, key)) {
                if (fn(target[key], key) === false) {
                    break;
                }
            }
        }
    }
};

var lowerCase = exports.lowerCase = function lowerCase(str) {
    return getStr(str).toLowerCase();
};