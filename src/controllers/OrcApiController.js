const apiPolicy = require('../policies/ApiPolicy')
const ERROR_MISSING_REQ_PAR_01 = 'Error [Parameter] [missing REQ_CONTEXT]'
const ERROR_MISSING_REQ_PAR_02 = 'Error [Parameter] [missing REQ_ACTION]'
const ERROR_MISSING_REQ_PAR_03 = 'Error [Parameter] [missing REQ_INPUTS]'
const ERROR_MISSING_REQ_PAR_04 = 'Error [Http] [missing httpRequest]'
const ERROR_MISSING_REQ_PAR_05 = 'Error [Http] [missing httpResponse]'

const main = this
main['httpRequest'] = null
main['httpResponse'] = null
main['next'] = null
main['REQ_CONTEX'] = 0
main['REQ_ACTION'] = 0
main['REQ_INPUTS'] = {}

function init (req, res, next) {
  main.httpRequest = req
  main.httpResponse = res
  main.next = next
  return main
}

async function preparams () {
  let msg = null
  if (!main.httpRequest) { msg = ERROR_MISSING_REQ_PAR_04 }
  if (!main.httpResponse) { msg = ERROR_MISSING_REQ_PAR_05 }

  const body = main.httpRequest.body
  const {REQ_CONTEX, REQ_ACTION, REQ_INPUTS} = body

  if (!REQ_CONTEX) { msg = ERROR_MISSING_REQ_PAR_01 }
  if (!REQ_ACTION) { msg = ERROR_MISSING_REQ_PAR_02 }
  if (!REQ_INPUTS) { msg = ERROR_MISSING_REQ_PAR_03 }
  if (msg) { return {isok: false, error: msg} }

  main.REQ_CONTEX = REQ_CONTEX
  main.REQ_ACTION = REQ_ACTION
  main.REQ_INPUTS = REQ_INPUTS
  
  /** use debug mode */
  console.log(main.REQ_CONTEX, main.REQ_ACTION, main.REQ_INPUTS)

  return {isok: true, error: null}
}

async function responseSender (result) {
  instance.main.httpResponse.status(result.status).send(result.output)
  return result
}

async function resolveError (paramErr) {
  const error = (paramErr.error && paramErr.error.length !== 0) ? paramErr.error : 'Não foi possivel concluir o pedido requerido. Por favor tente mais tarde. Obrigado.'
  instance.responseSender({status: 500, output: {error: error}})
}

const instance = {
  ApiPolicy: apiPolicy,
  init: (req, res, next) => {return init(req, res, next)},
  main: main,
  preparams: preparams,
  responseSender: (result) => {return responseSender(result)},
  resolveError: (paramErr) => {return resolveError(paramErr)}
}

module.exports = instance
