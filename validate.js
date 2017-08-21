let isPlainObject = require('is-plain-object')
let get = require('lodash.get')
let Messages = require('./messages')

const DEFAULT_ERROR_MSG_KEY = 'errors.validation.default'
const ERROR = 'error'
const WARNING = 'warning'

module.exports = function(fieldValue, fieldValidations, validator) {
  validator = validator || module.exports.validator
  let errors = []
  let warnings = []
  if(fieldValue === undefined || fieldValidations === undefined)
    return errors

  for( let validationName in fieldValidations ) {
    let validation = fieldValidations[validationName]
    let { fn, args, msg, kind } = parseValidation.bind(this)(fieldValue, validationName, validation, validator)
    let valid = fn.apply(this, args)
    //La funcion de validacion puede devolver un mensaje con el error
    if(typeof valid === 'string') {
      msg = valid
      valid = false
    }
    //La funcion de validacion puede devolver undefined si no encontro error
    valid = valid === undefined ? true : valid
    if (!valid) {
      kind = kind || ERROR
      msg =  msg && (msg.startsWith('#') ? Messages.get(msg) : msg) || Messages.get(DEFAULT_ERROR_MSG_KEY)
      let aux = kind === ERROR ? errors : warnings
      aux.push({msg, kind})
    }
  }
  //Primero los errores luego las advertencias
	return [...errors, ...warnings]
}
module.exports.validator = require('validator')
module.exports.ERROR = ERROR
module.exports.WARNING = WARNING

/**
 * Toma un descriptor de validacion y extrae la informacion necesaria
 * para procesar la validacion. Abajo un ejemplo de descriptor de validacion
 * para len.
 * 
 * {
 *   //Arreglo de argumentos
 *   len: [8,15],
 * 
 *   //Objeto descriptor 
 *   len: {
 *     arg: [8,15],
 *     msg: 'Longitud debe de $1 a $2 caracteres' //interpolacion de args
 *   },
 * 
 *   //Objecto descriptor con funcion custom
 *   isAfterStartDate: {
 *     arg: (value)=>  date > this.startDate,
 *     msg: 'Fecha de inicio $0'
 *   } 
 * }
 * 
 */
function parseValidation(value, validationName, desc, validator){
  let fn, args, msg, kind
  if (isPlainObject(desc)) {
    if (typeof desc.arg === 'function') {
      //Es funcion custom
      fn = desc.arg
      //En funciones custom el unico argumento es el valor del campo
      args = [value]
    }
    else {
      //Es funcion de validator
      fn = validator[validationName]
      args = [].concat(desc.arg)
      if(typeof args[0] === 'boolean') {
        let bool = args[0]
        //Si es false negamos la funcion
        if(bool === false) {
          let _fn = fn
          fn = (...args)=> !_fn(...args)
        }
      }

      args = [value].concat(args)
    }

    //Interpolamos los argumentos y el contexto (this) de la validacion en el mensaje
    if(desc.msg !== undefined)
      msg = desc.msg.replace(/\$([\w.\[\]]+(\]|\b))/g, (match, $1)=> args[$1] || get(this, $1))
    kind = desc.kind
  }

  else if (Array.isArray(desc) || typeof desc !== 'function') {
    //Es funcion de validator
    fn = validator[validationName]
    args = [].concat(desc)
    //Las funciones de validacion booleanas como isEmpty aceptan
    //un solo argumento booleano
    if(typeof args[0] === 'boolean') {
      let bool = args[0]
      //Si es false negamos la funcion
      if (bool === false) {
        let _fn = fn
        fn = (...args)=> !_fn(...args)
      }
    }
    args = [value].concat(args)
  }

  else if (typeof desc === 'function') {
    //Es funcion custom
    fn = desc
    //En funciones custom el unico argumento es el valor del atributo
    args = [value]
  }

  if(fn === undefined)
    throw new Error(`Validation function "${validationName}" does not exists`)

  return {fn, args, msg, kind}
}