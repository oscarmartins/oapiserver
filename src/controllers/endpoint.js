const orcapicontroller = require('./OrcApiController')
const apiPolicy = require('../policies/ApiPolicy')
const jwtoken = require('../utils/Utils')['jwtToken']
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
    console.log('PARAMVALIDATOR: ', paramValidator)
    if (paramValidator.isok) {
        switch (orcapicontroller.main.REQ_CONTEX) {
            case apiPolicy.services.root:
              await budgets()
              break;
            case apiPolicy.services.w2ui:
              const serverContext = orcapicontroller.main.httpRequest.headers.severcontext
              
              if(serverContext === 'w2ui') {
                  const w2ui = require('../services/w2ui')
                  const outresp = {}
                  
                  const authorization = jwtoken.tokenRequestVerify(orcapicontroller.main.httpRequest)
                  if(authorization) {
                    console.log('token authorization', authorization)
                  } else {
                    console.log('no authorization')
                  }

                  /**
                  let w2uiRespData = null
                  const w2uiRecord = orcapicontroller.main.httpRequest.body.record

                  let w2cmd = orcapicontroller.main.httpRequest.body.cmd

                  switch (orcapicontroller.main.REQ_ACTION) {
                      case 1000:
                      if (w2cmd === w2ui.SAVE) {
                        w2uiRespData = await w2ui.login(w2uiRecord)
                      } else { 
                        outresp['status'] = 'success'
                        outresp['record'] = w2cmd === w2ui.GET ? {email: 'exemplo@exemplo.com'} : {}
                      }
                        break;
                      case 2000:
                      w2uiRespData = await w2ui.register(w2uiRecord)
                        break;
                      default:
                        break;
                    }

                   **/


                  if(orcapicontroller.main.httpRequest.body.cmd === 'save') {
                    let w2uiRespData = null
                    const w2uiRecord = orcapicontroller.main.httpRequest.body.record
                    switch (orcapicontroller.main.REQ_ACTION) {
                      case apiPolicy.SIGNIN:
                      w2uiRespData = await w2ui.login(w2uiRecord)
                        break;
                      case apiPolicy.SIGNUP:                      
                      w2uiRespData = await w2ui.register(w2uiRecord)
                        break;
                      case apiPolicy.ACCOUNT_RECOVERY_EMAIL: 
                      case apiPolicy.ACCOUNT_RECOVERY_CODE:
                      case apiPolicy.ACCOUNT_RECOVERY_RESET:     
                      
                      const restest = await w2ui.passwordRecovery()
                      
                      w2uiRespData = {
                        status: 200,
                        output: {message: '', success:resolveW2uiResponses(orcapicontroller.main.httpRequest.body.record)}
                      }  
                        break;
                      default:
                        break;
                    }
                  
                    if(w2uiRespData.status === 200){  
                      outresp['status'] = 'success'
                      outresp['dataresponse'] = w2uiRespData
                    } else {
                      let message = 'found error '
                      switch (w2uiRespData.status) {
                        case 400:
                        case 403:
                          message = w2uiRespData.output.error
                          break;
                        default:
                          break;
                      }

                      outresp['status'] = 'error'
                      outresp['message'] = message
                    }
                  } else {
                    if (orcapicontroller.main.httpRequest.body.cmd) {
                      const w2uicmd = orcapicontroller.main.httpRequest.body.cmd
                      if (w2uicmd === 'get') {
                        Object.assign(outresp, resolveW2uiResponses(orcapicontroller.main.httpRequest.body.record))
                      } else {
                        outresp['status'] = 'success'
                        outresp['record'] = {/**clear**/}
                      }
                    }
                  }
                orcapicontroller.responseSender({status: 200, output: outresp})
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

function resolveW2uiResponses (records) {
  const w2uiRecord = records || null
  var outresp = {}
  switch (orcapicontroller.main.REQ_ACTION) {
    case apiPolicy.SIGNIN:
      outresp['status'] = 'success'
      outresp['record'] = {email: 'exemplo@exemplo.com'}
      break;
    case apiPolicy.SIGNUP:
      outresp['status'] = 'success'
      outresp['record'] = {name: 'exemplo', email: 'exemplo@exemplo.com'}
      break;
    case apiPolicy.ACCOUNT_RECOVERY_EMAIL:
      outresp['status'] = 'success'
      outresp['record'] = {email: (w2uiRecord ? w2uiRecord.email : 'exemplo@exemplo.com')}
      outresp['fields'] = [{ name: 'code', type: 'text', required: true, html: { caption: 'code', attr: 'style="width: 300px"' } }]
      break;
    case apiPolicy.ACCOUNT_RECOVERY_CODE:
      outresp['status'] = 'success'
      outresp['record'] = {code: w2uiRecord ? w2uiRecord.code : 'codigo segurança'}
      outresp['fields'] = [{ name: 'password', type: 'password', required: true, html: { caption: 'password', attr: 'style="width: 300px"' } },
                           { name: 'passwordConfirm', type: 'password', required: true, html: { caption: 'password confirm', attr: 'style="width: 300px"' } }]
    break;
    case apiPolicy.ACCOUNT_RECOVERY_RESET:
      outresp['status'] = 'success'
      outresp['record'] = {code: w2uiRecord ? w2uiRecord.code : 'codigo segurança'}
      outresp['fields'] = []
    break;
    default:
      outresp['status'] = 'success'
      outresp['record'] = {}
      break;
  }
  return outresp
}

const endpoint = {
  execute: (req, res, next) => {execute(req, res, next)}
}

module.exports = endpoint
