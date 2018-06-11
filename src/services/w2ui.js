const auth = require('../controllers/AuthenticationController')
const AccountPolicy = require('../policies/AccountPolicy')
const EmailManager = require('../controllers/EmailManager')
const jwtoken = require('../utils/Utils')['jwtToken']
const orcapicontroller = {}
const ERROR_MESSAGE_NO_ARGUMENTS = 'Nao foi possivel executar o servico. Erro no argumento base.'
const ERROR_MESSAGE_CMD_NOT_IMPLEMENTED = '** COMANDO NÃO ESTA IMPLEMENTADO **'
const ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED = '** RESPONSE ACTION NÃO ACEITE **'
const SAVE = 'save'
const GET = 'get'

const apiPolicy = auth.options

async function register (w2records) {
    const vres = AccountPolicy.validateSignInAndUp(w2records)
    if (vres.isok) {
        const w2signup = await auth.signup(w2records)
        return w2signup
    } else { 
        return {
            status: 403,
            output: vres
        }
    }
}

async function login (w2records) {
    const w2Signin = await auth.signin(w2records)
    return w2Signin
}

async function passwordRecovery (w2records) {
    const payload = {
        REQ_CONTEX : 0,
        REQ_ACTION : 0,
        REQ_INPUTS : {}
    }    
    payload.REQ_CONTEX = orcapicontroller.main.REQ_CONTEX
    payload.REQ_ACTION = orcapicontroller.main.REQ_ACTION
    payload.REQ_INPUTS = orcapicontroller.main.REQ_INPUTS || {}

    Object.assign(payload.REQ_INPUTS, w2records)

    let mode = null
    if (orcapicontroller.main.REQ_ACTION === apiPolicy.ACCOUNT_RECOVERY_EMAIL) {
        mode = 'email'
    }
    if (orcapicontroller.main.REQ_ACTION === apiPolicy.ACCOUNT_RECOVERY_CODE) {
        mode = 'code'
    }
    if (orcapicontroller.main.REQ_ACTION === apiPolicy.ACCOUNT_RECOVERY_RESET) {
        mode = 'reset'
    }
    
    const checkRecords = AccountPolicy.accountRecovery(mode, payload.REQ_INPUTS)

    if (checkRecords.isok) {
        const result = await auth.passwordRecovery(payload)
        return result
    } else {
        return {
            status: 500,
            output: {error: checkRecords.error}
          }
    }

    
}

async function logout () {
    const resutl = await auth.signout()
}

async function emailManager (orcapicontroller) {
    const exec = await EmailManager.execute(orcapicontroller)
    return exec
}

async function checkAuthorization () {
    const authorization = jwtoken.tokenRequestVerify(orcapicontroller.main.httpRequest)
    if(authorization) {
        //console.log('token authorization', authorization)
    } else {
        //console.log('no authorization')
    }
    return authorization
}

async function executeService (oap) {
    let w2uiRespData = {
        status: 200,
        message: ''
    }
    try {        
        if (oap) {
            Object.assign(orcapicontroller,oap)

            const checkAuthorizationTest = await checkAuthorization()
            //console.log('checkAuthorization', checkAuthorizationTest)            
            const {record, cmd} = orcapicontroller.main.httpRequest.body
            
            switch (orcapicontroller.main.REQ_ACTION) {
                case apiPolicy.SIGNUP:
                    if (cmd === SAVE) {
                        w2uiRespData = await register(record)
                    } else if (cmd === GET) {
                        //throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
                        w2uiRespData.message = GET + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    } else {
                        w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    }                          
                    break;
                case apiPolicy.SIGNIN:
                    if (cmd === SAVE) {
                        w2uiRespData = await login(record)
                    } else if (cmd === GET) {
                        //throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
                        w2uiRespData.message = GET + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    } else {
                        w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    }                          
                    break;
                case apiPolicy.ACCOUNT_RECOVERY_EMAIL: 
                case apiPolicy.ACCOUNT_RECOVERY_CODE:
                case apiPolicy.ACCOUNT_RECOVERY_RESET:
                    if (cmd === SAVE) {
                        w2uiRespData = await passwordRecovery(record)                        
                        console.log('passwordRecovery', w2uiRespData)

                        if (w2uiRespData && w2uiRespData.hasOwnProperty('accountStatus')){
                            w2uiRespData['updateClient'] = {
                                nextReqAction: 0,
                                fields: [],
                                record: {},
                                message: ''
                            }
                            const _accountStatus = w2uiRespData.accountStatus
                            w2uiRespData.updateClient.message = _accountStatus.message
                            /**
                             * 'codevalidation'
                             * 'email'
                             * 'code'
                             * 'passwords'
                             * 'resume'
                             */

                            switch (_accountStatus.params.selectionMode) {
                                case 'email':
                                case 'resume':
                                    w2uiRespData.updateClient.nextReqAction = apiPolicy.ACCOUNT_RECOVERY_EMAIL
                                    w2uiRespData.updateClient.fields.push({ name: 'email', type: 'text', required: true, html: { caption: 'Email Registo', attr: 'style="width: 300px"' } })                                                                     
                                    break;
                                case 'code':
                                    w2uiRespData.updateClient.nextReqAction = apiPolicy.ACCOUNT_RECOVERY_CODE
                                    w2uiRespData.updateClient.fields.push({ name: 'code', type: 'text', required: true, html: { caption: 'Código de Segurança', attr: 'style="width: 300px"' } })
                                    break;
                                case 'passwords':
                                    w2uiRespData.updateClient.nextReqAction = apiPolicy.ACCOUNT_RECOVERY_RESET
                                    w2uiRespData.updateClient.fields.push({ name: 'password', type: 'password', required: true, html: { caption: 'Chave secreta', attr: 'style="width: 300px"' } },
                                    { name: 'confirmPassword', type: 'password', required: true, html: { caption: 'Chave secreta confirmar', attr: 'style="width: 300px"' } })
                                    break;
                                default:
                                    w2uiRespData.message = 'Erro na resposta modulo'
                                    break;
                            }
                        } else {

                        }

                    } else if (cmd === GET) {
                        //throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
                        w2uiRespData.message = GET + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    } else {
                        w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                    }  
                    break;
                default:
                    throw new Error(ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED)
                    break;
            }
        } else {
            throw new Error(ERROR_MESSAGE_NO_ARGUMENTS)
        }
    } catch (error) {
        w2uiRespData = {
            status: 400,
            output: {
                error: error.message
            }
        }
    }

    const outresp = {}
    if(w2uiRespData.status === 200){  
        outresp['status'] = 'success'
        outresp['dataresponse'] = w2uiRespData
    } else {
        let message = 'found error '
        switch (w2uiRespData.status) {
            case 400:
            case 403:
            case 500:
            message = w2uiRespData.output.error
            break;
            default:
            break;
        }
        outresp['status'] = 'error'
        outresp['message'] = message
    }

    return outresp
}

function resolveW2uiResponses (records) {
    const w2uiRecord = records || null
    var respOutput = {}
    switch (orcapicontroller.main.REQ_ACTION) {
      case apiPolicy.SIGNIN:
        respOutput['status'] = 'success'
        respOutput['record'] = {email: 'exemplo@exemplo.com'}
        break;
      case apiPolicy.SIGNUP:
        respOutput['status'] = 'success'
        respOutput['record'] = {name: 'exemplo', email: 'exemplo@exemplo.com'}
        break;
      case apiPolicy.ACCOUNT_RECOVERY_EMAIL:
        respOutput['status'] = 'success'
        respOutput['record'] = {email: (w2uiRecord ? w2uiRecord.email : 'exemplo@exemplo.com')}
        respOutput['fields'] = [{ name: 'code', type: 'text', required: true, html: { caption: 'code', attr: 'style="width: 300px"' } }]
        break;
      case apiPolicy.ACCOUNT_RECOVERY_CODE:
        respOutput['status'] = 'success'
        respOutput['record'] = {code: w2uiRecord ? w2uiRecord.code : 'codigo segurança'}
        respOutput['fields'] = [{ name: 'password', type: 'password', required: true, html: { caption: 'password', attr: 'style="width: 300px"' } },
                             { name: 'passwordConfirm', type: 'password', required: true, html: { caption: 'password confirm', attr: 'style="width: 300px"' } }]
      break;
      case apiPolicy.ACCOUNT_RECOVERY_RESET:
        respOutput['status'] = 'success'
        respOutput['record'] = {code: w2uiRecord ? w2uiRecord.code : 'codigo segurança'}
        respOutput['fields'] = []
      break;
      default:
        respOutput['status'] = 'success'
        respOutput['record'] = {}
        break;
    }
    return respOutput
  }

const instance = {
    options:apiPolicy,
    executeService: executeService   
}

module.exports = instance
