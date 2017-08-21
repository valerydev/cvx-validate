let chai = require('chai')
let expect = chai.expect

let validate = require('./validate')

describe('validate', ()=> {

  it('Debe retornar vacio si no recibe valor a validar y objecto descriptor de validaciones', ()=> {
    expect(validate()).to.be.an('array').and.to.be.empty
    expect(validate('someValue')).to.be.an('array').and.to.be.empty
    expect(validate({ isEmpty: false })).to.be.an('array').and.to.be.empty
  })

  it('Debe retornar vacio si no se consiguen errores', ()=> {
    expect(validate(1, validate({ matches: /\d/ }))).to.be.an('array').and.to.be.empty
  })

  it('Debe aceptar como ultimo argumento un sustituto (o mock) de libreria de funciones de validacion', ()=> {
    let fn1 = jest.fn()
    validate('value', {fn1: true},{fn1})
    expect(fn1.mock.calls[0][0]).to.eql('value')
  })

  it('Debe aceptar un literal si la validacion solo requiere un argumento', ()=> {

    let fn1 = jest.fn().mockReturnValue(true)
    let fn2 = jest.fn().mockReturnValue(true)
    let fn3 = jest.fn().mockReturnValue(true)
    let fn4 = jest.fn().mockReturnValue(false)

    let validations = {
      fn1: 3,
      fn2: 'data',
      fn3: true,
      fn4: false
    }
    let errors = validate(null, validations, { fn1, fn2, fn3, fn4 })

    expect(errors).to.be.empty
    expect(fn1.mock.calls[0]).to.have.lengthOf(2)
    expect(fn2.mock.calls[0]).to.have.lengthOf(2)
    expect(fn3.mock.calls[0]).to.have.lengthOf(2)
    expect(fn4.mock.calls[0]).to.have.lengthOf(2)

    expect(fn1.mock.calls[0][1]).to.eql(validations.fn1)
    expect(fn2.mock.calls[0][1]).to.eql(validations.fn2)
    expect(fn3.mock.calls[0][1]).to.eql(validations.fn3)
    expect(fn4.mock.calls[0][1]).to.eql(validations.fn4)
  })

  it('Debe aceptar arreglo de argumentos en validaciones que acepten mas de un argumento', ()=> {
    let fn1 = jest.fn().mockReturnValue(true)
    let validations = { fn1: [1, 2, 3] }
    validate(null, validations, { fn1 })
    expect( fn1.mock.calls[0] ).to.have.members([null, 1, 2, 3])
  })

  it('Debe aceptar objeto de descripcion de validacion como validacion', ()=> {
    let fn1 = jest.fn().mockReturnValue(false)
    let fn2 = jest.fn().mockReturnValue(false)

    let validations = {
      fn1: {
        arg: 1,
        msg: 'This is a warning',
        kind: validate.WARNING
      },
      fn2: {
        arg: [1, 2],
        msg: 'This is an error',
        kind: validate.ERROR
      }
    }
    let errors = validate(null, validations, {fn1, fn2})

    expect(errors).to.be.an('array').that.have.lengthOf(2)
    expect(errors).to.have.nested.property('[0].kind', validate.ERROR)
    expect(errors).to.have.nested.property('[1].kind', validate.WARNING)
  })

  it('Debe aceptar funcion de validacion personalizada como validacion, esta recibirá ' +
    'como argumento el valor del campo', ()=> {
    const ERROR_MSG = 'ERROR_MSG'
    let custom1 = jest.fn().mockReturnValue(undefined) //devuelve true o undefined si no se encontro error
    let custom2 = jest.fn().mockReturnValue(ERROR_MSG) //devuelve false o string (con el mensaje) si encontro error
    let custom3 = {
      arg: jest.fn().mockReturnValue(false), //devuelve truthy o falsy en caso o no de error
      msg: ERROR_MSG,
      kind: validate.ERROR
    }

    let value = 'some value'
    let errors = validate(value, {custom1, custom2, custom3})

    expect(custom1.mock.calls[0][0]).to.eql(value)
    expect(custom2.mock.calls[0][0]).to.eql(value)
    expect(custom3.arg.mock.calls[0][0]).to.eql(value)
    expect(errors).to.have.lengthOf(2).and.to.eql([
      {msg: ERROR_MSG, kind: validate.ERROR},
      {msg: ERROR_MSG, kind: validate.ERROR}
    ])
  })

  it('Debe retornar un arreglo con objetos descriptor de error', ()=> {
    let fn1 = jest.fn().mockReturnValue(false)
    let fn2 = jest.fn().mockReturnValue(false)

    let validations = {
      fn1: true,
      fn2: true
    }

    let errors = validate(null, validations, {fn1, fn2})

    expect(errors).to.be.an('array').that.have.lengthOf(2)
    expect(errors[0]).to.have.keys(['msg', 'kind'])
    expect(errors[1]).to.have.keys(['msg', 'kind'])
  })

  it('Debe retornar un arreglo ordenado primero errores y luego advertencias', ()=> {
    let fn1 = jest.fn().mockReturnValue(false)
    let fn2 = jest.fn().mockReturnValue(false)

    let validations = {
      fn1: {
        arg: true,
        kind: validate.WARNING
      },
      fn2: {
        arg: true,
        kind: validate.ERROR
      }
    }
    let errors = validate(null, validations, {fn1, fn2})

    expect(errors).to.be.an('array').that.have.lengthOf(2)
    expect(errors).to.have.nested.property('[0].kind', validate.ERROR)
    expect(errors).to.have.nested.property('[1].kind', validate.WARNING)
  })

  it('Debe colocar por omision un mensaje de error/advertencia internacionalizado') //TODO: i18n

  it('Debe interpolar argumentos de validacion en mensaje de error/advertencia')

  it.only('Debe pasar el contexto (this) a las funciones de validacion personalizadas', ()=> {
    let form = {
      dates: ['1982-10-16', '1999-09-01']
    }

    let errors = validate.bind(form)('1980-10-16', {
      isAfterStart: {
        arg: function (value) {
          return new Date(value) > new Date(this.startDate)
        },
        msg: 'Fecha final "$0" anterior a inicial "$dates[0]"'
      }
    })
    expect(errors).to.have.lengthOf(1)
    expect(errors[0]).to.have.property('msg').that.eql(`Fecha final "${form.dates[1]}" anterior a inicial "${form.dates[0]}"`)
  })

  it('Debe lanzar excepcion en caso de no existir alguna funcion de validacion', ()=> {
    expect(()=> validate(null, { nonExistentValidation: true })).to.throw()
  })
})






