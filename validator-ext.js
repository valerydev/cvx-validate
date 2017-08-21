let validator = require('validator')

validator.extend = function(name, fn) {
  this[name] = fn
  return this
}
validator.notEmpty = function(str) {
  return !str.match(/^[\s\t\r\n]*$/)
}
validator.len = function(str, min, max) {
  return this.isLength(str, min, max)
}
validator.len = function(str, min, max) {
  return this.isLength(str, min, max)
}
validator.isUrl = function(str) {
  return this.isURL(str)
}
validator.isIPv6 = function(str) {
  return this.isIP(str, 6)
}
validator.isIPv4 = function(str) {
  return this.isIP(str, 4)
}
validator.notIn = function(str, values) {
  return !this.isIn(str, values)
}
validator.regex = function(str, pattern, modifiers) {
  str += ''
  if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
    pattern = new RegExp(pattern, modifiers)
  }
  return str.match(pattern)
}
validator.notRegex = function(str, pattern, modifiers) {
  return !this.regex(str, pattern, modifiers)
}
validator.isDecimal = function(str) {
  return str !== '' && str.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/)
}
validator.min = function(str, val) {
  const number = parseFloat(str)
  return isNaN(number) || number >= val
}
validator.max = function(str, val) {
  const number = parseFloat(str)
  return isNaN(number) || number <= val
}
validator.not = function(str, pattern, modifiers) {
  return this.notRegex(str, pattern, modifiers)
}
validator.contains = function(str, elem) {
  return str.indexOf(elem) >= 0 && !!elem
}
validator.notContains = function(str, elem) {
  return !this.contains(str, elem)
}
validator.is = function(str, pattern, modifiers) {
  return this.regex(str, pattern, modifiers)
}
validator.gt = function (str, val)  {
  const number = parseFloat(str)
  return isNaN(number) || number > val
}
validator.lt = function (str, val) {
  const number = parseFloat(str)
  return isNaN(number) || number < val
}
validator.gte = validator.min
validator.lte = validator.max
validator.notNull = validator.notEmpty

module.exports = validator