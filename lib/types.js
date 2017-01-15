'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isType = exports.isType = function isType(type) {
  return function (obj) {
    return obj != null && Object.prototype.toString.call(obj) === '[object ' + type + ']';
  };
};
var isFn = exports.isFn = isType('Function');
var isArr = exports.isArr = Array.isArray || isType('Array');
var isObj = exports.isObj = isType('Object');
var isStr = exports.isStr = isType('String');
var isNum = exports.isNum = isType('Number');
var isIter = exports.isIter = function isIter(obj) {
  return isArr(obj) || isObj(obj);
};