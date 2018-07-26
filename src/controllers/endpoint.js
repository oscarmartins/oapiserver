const orcapicontroller = require('./OrcApiController')
const apiPolicy = require('../policies/ApiPolicy')
const _budgets = require('../services/budgets')

async function budgets () {
    var result = null
    switch (orcapicontroller.main.REQ_ACTION) {
      case apiPolicy.services.budgetsRequest:       
        result = await _budgets.budgetsRequest(orcapicontroller)        
        orcapicontroller.responseSender({status: 200, output: result.data})
      break;    
    default:
      orcapicontroller.resolveError({error: 'Error [Budgets service not found] budgets()' })
      break;
    }
    return result
}

async function w2uiService () {
  const serverContext = orcapicontroller.main.httpRequest.headers.severcontext
  var outresp = {}           
  if(serverContext === 'w2ui') {
    const w2uiService = require('../services/w2ui')
    outresp = await w2uiService.executeService(orcapicontroller)
    /****/  
    orcapicontroller.responseSender({status: 200, output: outresp})
    /****/    
  } else {
    orcapicontroller.resolveError({error: 'Error [w2ui serverContext not found] ' })
  }   
  return outresp    
}

async function execute (req, res, next) {
    console.log('Intro EndPoint app -> execute <-')
    if (next) {
      console.log('next exist')
    }

    var hasErrors = false; // local control
    
    orcapicontroller.init(req, res, next)

    if (req.originalUrl.includes('viewController')){
      const viewController = require('./ViewController')
      const vres = await viewController.loadView(orcapicontroller)
      return next()
    }

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
              const respBudget = await budgets()
              break;
            case apiPolicy.services.w2ui:
              const respw2ui = await w2uiService()     
              break;
            default:
              paramValidator.error = '** [The Request Context ({]REQCTX[}) not found] **'.replace('{]REQCTX[}',orcapicontroller.main.REQ_CONTEX)
              hasErrors = true
              break;
        }
    } else {
      hasErrors = true
    }
    if (hasErrors) {
      orcapicontroller.resolveError(paramValidator)
    }
    return true
} 

const endpoint = {
  execute: async (req, res, next) => {execute(req, res, next)}
}

module.exports = endpoint
