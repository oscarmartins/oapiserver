const auth = require('../controllers/AuthenticationController')
const {save, saveAndPublish, fetchAll, deleteById, publishedById, findById, pubUpdateById} = require('../controllers/StandBlog')
const AccountPolicy = require('../policies/AccountPolicy')
const EmailManager = require('../controllers/EmailManager')
const jwtoken = require('../utils/Utils')['jwtToken']
const orcapicontroller = {}
const ERROR_MESSAGE_NO_ARGUMENTS = 'Nao foi possivel executar o servico. Erro no argumento base.'
const ERROR_MESSAGE_CMD_NOT_IMPLEMENTED = '** COMANDO NÃO ESTA IMPLEMENTADO **'
const ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED = '** RESPONSE ACTION NÃO ACEITE **'
const ERROR_MESSAGE_USER_NOT_AUTHORIZED = '[SECURITY] NOT AUTHORIZED!!'
const SAVE = 'save'
const DELETE = 'delete'
const GET = 'get'
const GRID_CODE = 1290.100
const FORM_CODE = 1290.200

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

    const req_action = orcapicontroller.main.REQ_ACTION
    let mode = null
    switch (req_action) {
        case apiPolicy.ACCOUNT_RECOVERY_EMAIL: mode = 'email'; break;
        case apiPolicy.ACCOUNT_RECOVERY_CODE: mode = 'code'; break;
        case apiPolicy.ACCOUNT_RECOVERY_RESET: mode = 'reset'; break;
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
        message: '',
        output: {
            error: ''
        }
    }
    try {        
        if (oap) {
            Object.assign(orcapicontroller,oap);
            const {record, cmd, limit, offset, selected, name} = orcapicontroller.main.httpRequest.body;
            
            this.checkAuthorizationTest = await checkAuthorization();
            
            switch (orcapicontroller.main.REQ_ACTION) {
                case 100200: 
                case 100400:
                case 100600: 
                    if (!this.checkAuthorizationTest) {
                        switch (orcapicontroller.main.REQ_ACTION) {
                            case 100200:
                            case 100400:
                                throw new Error(ERROR_MESSAGE_USER_NOT_AUTHORIZED)
                            default:
                                break;
                        }
                    }
                    w2uiRespData.status = 200;
                    let res = null;
                    if (orcapicontroller.main.REQ_ACTION === 100200) {
                        res = await save(orcapicontroller.main.REQ_INPUTS)
                    } else if (orcapicontroller.main.REQ_ACTION === 100400) {
                        res = await saveAndPublish(orcapicontroller.main.REQ_INPUTS)
                    } else if (orcapicontroller.main.REQ_ACTION === 100600) {
                        /**
                         * RestFull actions
                         * SUBACTION
                         * SUBVALUE
                         *  **/
                        if (orcapicontroller.main.REQ_INPUTS.SUBACTION) {
                            const subaction = orcapicontroller.main.REQ_INPUTS.SUBACTION
                            if (this.checkAuthorizationTest && subaction === 'pubUpdateById') {
                                res = await pubUpdateById(orcapicontroller.main.REQ_INPUTS)
                            } else if (subaction === 'findById') {
                                res = await findById(orcapicontroller.main.REQ_INPUTS)
                            } else if (subaction === 'readAll') {
                                res = await fetchAll(orcapicontroller.main.REQ_INPUTS)
                            } else if (this.checkAuthorizationTest && subaction === 'deleteById') {
                                res = await deleteById(orcapicontroller.main.REQ_INPUTS)
                            } else if (this.checkAuthorizationTest && subaction === 'publishedById') {
                                res = await publishedById(orcapicontroller.main.REQ_INPUTS)
                            } else {
                                w2uiRespData.message = POST + ' REQ_INPUTS=' + orcapicontroller.main.REQ_INPUTS + ' ' + ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED
                            }
                        } else {
                            w2uiRespData.message = POST + ' REQ_INPUTS.SUBACTION=' + orcapicontroller.main.REQ_INPUTS + ' ' + ERROR_MESSAGE_NO_ARGUMENTS
                        }
                    } else {
                        w2uiRespData.message = POST + ' REQ_ACTION=' + orcapicontroller.main.REQ_ACTION + ' ' + ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED
                    }

                    if (res && res.iook) {
                        w2uiRespData.output = res
                    } else {
                        w2uiRespData.status = 400
                        w2uiRespData.output.error = res.error
                    }

                    break;
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
                    case 1290: 
                        if (!this.checkAuthorizationTest) {
                            throw new Error(ERROR_MESSAGE_USER_NOT_AUTHORIZED)
                        }
                        if (cmd === SAVE) {
                            w2uiRespData.message = SAVE + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                        } else if (cmd === GET) {
                            const {User} = require('../models')
                            const usrs = await User.find({})                            
                            const _data = {
                                status: GRID_CODE,
                                output: {
                                    "total": usrs.length,
                                    "records": []
                                }
                              }
                              let item = {}
                              usrs.forEach(function (i, p) {
                                item = {
                                    recid: p,
                                    id: i.id,
                                    name: i.name,
                                    email: i.email
                                 } 
                                _data.output.records.push(item)
                              });

                            w2uiRespData = _data
                        } else {
                            w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                        }         
                    break
                    case 12100:                         
                        if (!this.checkAuthorizationTest) {
                            throw new Error(ERROR_MESSAGE_USER_NOT_AUTHORIZED)
                        }
                        if (cmd === SAVE) {
                            w2uiRespData.message = SAVE + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                        } else if (cmd === GET) {
                            const {Accounts} = require('../models')
                            const accounts = await Accounts.find({})                            
                            const _data = {
                                status: GRID_CODE,
                                output: {
                                    "total": accounts.length,
                                    "records": []
                                }
                              }
                              let item = {}
                              accounts.forEach(function (i, p) {
                                item = {
                                    recid: p,
                                    user_id: i.user_id,
                                    accountStatus: i.accountStatus,
                                    nextStage: i.nextStage,
                                    code: i.code,
                                    dateCreated: i.dateCreated,
                                    dateUpdated: i.dateUpdated
                                 } 
                                _data.output.records.push(item)
                              });
                            w2uiRespData = _data
                        } else {
                            w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                        }         
                    break
                    case 700999: 
                        if (!this.checkAuthorizationTest) {
                            throw new Error(ERROR_MESSAGE_USER_NOT_AUTHORIZED)
                        }
                        if (cmd === SAVE) {
                            w2uiRespData.message = SAVE + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                        } else if (cmd === GET) {
                            
                            const {Banners} = require('../models')
                            const banners = await Banners.find({userid: user_id})                            
                            
                            const ff = 0;

                            /**
                            const banners = [
                                {recid: 0,id: '12345',name: 'banner test',toptitle: 'banner@email.com'},
                            ];
                            */

                            const _data = {
                                status: GRID_CODE,
                                output: {
                                    "total": banners.length,
                                    "records": []
                                }
                              };
                              /**
                              banners.forEach(function (i, p) {
                                _data.output.records.push({
                                    recid: p,
                                    id: i.id,
                                    name: i.name,
                                    toptitle: i.toptitle
                                 });
                              });
                              */
                            w2uiRespData = _data;
                        } else {
                            w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED;
                        }         
                    break
                case 130013:
                if (!this.checkAuthorizationTest) {
                    throw new Error(ERROR_MESSAGE_USER_NOT_AUTHORIZED)
                }
                const customerController = require('../controllers/CustomerController')
                let customer = null
                let message = ''
                if (cmd === SAVE || cmd === GET) {
                    customer = await customerController.nohttp.fechCustomerProfile({
                        _id: this.checkAuthorizationTest._id,
                        email: this.checkAuthorizationTest.email
                    });
                    if (customer.iook) {
                        if (cmd === GET) {
                            //no msg
                        } else if (cmd === SAVE) {
                            customer = await saveAndUpateCustomer (customerController, this, record);
                            message = 'Perfil atualizado com sucesso.'
                        }
                    } else {
                        if (cmd === GET) {
                            throw new Error('Ainda não atualizou os seus dados!')
                        } else if (cmd === SAVE) {
                            customer = await saveAndUpateCustomer (customerController, this, record);
                            message = 'Perfil atualizado com sucesso.'
                        }
                    }
                    if (customer.iook) {
                        const _data = {
                            status: FORM_CODE,
                            message: message,
                            output: {
                                "name" : name || '',
                                "record": {
                                    firstName: customer.data.firstName,
                                    lastName: customer.data.lastName,
                                    gender: customer.data.gender,
                                    birthDate: customer.data.birthDate,
                                    mobileNumber: customer.data.mobileNumber,
                                    email: customer.data.email
                                }
                            }
                          }
                        w2uiRespData = _data
                    } else {
                        throw new Error(customer.error)
                    }
                } else {
                    w2uiRespData.message = cmd + '  ' + ERROR_MESSAGE_CMD_NOT_IMPLEMENTED
                }         
                break
                default:
                    throw new Error(ERROR_MESSAGE_REQACTION_NOT_IMPLEMENTED)
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
    } else if(w2uiRespData.status === FORM_CODE){
        w2uiRespData.status = 200 
        outresp['status'] = 'success'
        outresp['dataresponse'] = w2uiRespData
        outresp['name'] = w2uiRespData.output.name || ''
        outresp['record'] = w2uiRespData.output.record
        outresp['message'] = w2uiRespData.message || ''
    } else if(w2uiRespData.status === GRID_CODE){ 
        w2uiRespData.status = 200
        outresp['status'] = 'success'
        outresp['dataresponse'] = w2uiRespData
        outresp['total'] = w2uiRespData.output.total
        outresp['records'] = w2uiRespData.output.records
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

async function saveAndUpateCustomer (customerController, sessionData, record) {
    var user = {
        _id: sessionData.checkAuthorizationTest._id,
        email: sessionData.checkAuthorizationTest.email
    };
    var fields = record;
    var customer = await customerController.nohttp.updateCustomerProfile({user, fields});
    if (customer) {
        var test = 0;
    }
    return customer
}

module.exports = instance
