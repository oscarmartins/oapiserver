const accountController = require('../controllers/AccountController')
const auth = require('../controllers/AuthenticationController')
const AccountPolicy = require('../policies/AccountPolicy')
const EmailManager = require('../controllers/EmailManager')
const jwtoken = require('../utils/Utils')['jwtToken']
const orcapicontroller = {}
const ERROR_MESSAGE_NO_ARGUMENTS = 'Nao foi possivel executar o servico. Erro no argumento base.'
const ERROR_MESSAGE_CMD_NOT_IMPLEMENTED = '** COMANDO NÃO ESTA IMPLEMENTADO **'
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
    const result = await auth.passwordRecovery(payload)
    return result
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
        status: 200
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
                    }                        
                    break;
                case apiPolicy.SIGNIN:
                    if (cmd === SAVE) {
                        w2uiRespData = await login(record)
                    } else if (cmd === GET) {
                        //throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
                    }                        
                    break;
                case apiPolicy.ACCOUNT_RECOVERY_EMAIL: 
                case apiPolicy.ACCOUNT_RECOVERY_CODE:
                case apiPolicy.ACCOUNT_RECOVERY_RESET:
                    if (cmd === SAVE) {
                        w2uiRespData = await passwordRecovery(record)
                        console.log('passwordRecovery', w2uiRespData)
                    } else if (cmd === GET) {
                        //throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
                    }  
                    break;
                default:
                    throw new Error(ERROR_MESSAGE_CMD_NOT_IMPLEMENTED)
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

const instance = {
    options:apiPolicy,
    executeService: executeService   
}

module.exports = instance
