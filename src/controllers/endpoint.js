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

async function execute (req, res) {
    console.log('Intro EndPoint app')
    var hasErrors = false; // local control
    orcapicontroller.init(req, res)
    const paramValidator = await orcapicontroller.preparams()
    if (paramValidator.isok) {
        switch (orcapicontroller.main.REQ_CONTEX) {
            case apiPolicy.services.root:
              await budgets()
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
  execute: (req, res) => {execute(req, res)}
}

module.exports = endpoint
