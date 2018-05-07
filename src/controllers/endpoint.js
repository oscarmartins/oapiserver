const orcapicontroller = require('./OrcApiController')
const apiPolicy = require('../policies/ApiPolicy')
const _budgets = require('../services/budgets')

function resolveError (paramErr) {
  const error = (paramErr.error && paramErr.error.length !== 0) ? paramErr.error : 'Não foi possivel concluir o pedido requerido. Por favor tente mais tarde. Obrigado.'
  orcapicontroller.responseSender({status: 500, output: {error: error}})
}

async function budgets () {
    var result = null
    switch (orcapicontroller.main.REQ_ACTION) {
      case apiPolicy.services.budgetsRequest:       
        result = await _budgets.budgetsRequest(orcapicontroller)        
        orcapicontroller.responseSender({status: 200, output: result.data})
      break;    
    default:
        resolveError({error: 'Error [Budgets service not found] budgets()' })
        break;
    }
    return result
}

async function execute (req, res, next) {
    if (next) {
      console.log('next exist')
    }
    console.log('Intro EndPoint app')

    var hasErrors = false; // local control
    
    orcapicontroller.init(req, res, next)

    if(Object.keys(req.body).length === 0){
      /**
      console.log(req)
      orcapicontroller.responseSender({status: 200, output: {'status': 'success'}})
      return true;
      **/
     console.log('*** http request datatype error -> body empty ***')
    }

    const paramValidator = await orcapicontroller.preparams()
    if (paramValidator.isok) {
        switch (orcapicontroller.main.REQ_CONTEX) {
            case apiPolicy.services.root:
              await budgets()
              break;
            case 9999:
            if(orcapicontroller.main.REQ_INPUTS.hasOwnProperty('origin') && orcapicontroller.main.REQ_INPUTS.origin === 'w2ui') {
              console.info('Mode: ' + orcapicontroller.main.REQ_INPUTS.origin)
              console.log(orcapicontroller.main.httpRequest.body)
              const out = {}
              if(orcapicontroller.main.httpRequest.body.cmd === 'save') {
                const w2ui = require('../services/w2ui')
                const data = await w2ui.login(orcapicontroller.main.httpRequest.body.record)
                console.log(data)               
                if(data.status === 200){
                  out['status'] = 'success'
                  out['dataresponse'] = data
                } else if(data.status === 403){
                  out['status'] = 'error'
                  out['message'] = data.output.error
                }
              } else {
                out['status'] = 'success'
                out['record'] = {email: 'exemplo@exemplo.com'}
              }
              
              orcapicontroller.responseSender({status: 200, output: out})
            } else {
              hasErrors = true
            }              
            break;
            default:
              hasErrors = true
              break;
        }
    } else {
      hasErrors = true
    }
    if (hasErrors) {
      resolveError(paramValidator)
    }
    return true
} 

const endpoint = {
  execute: (req, res, next) => {execute(req, res, next)}
}

module.exports = endpoint
