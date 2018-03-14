const orcapicontroller = require('./OrcApiController')
const AuthenticationController = require('./AuthenticationController')
const CustomerController = require('./CustomerController')
const AccountPolicy = require('../policies/AccountPolicy')

function validateSignInAndUp () { return AccountPolicy.validateSignInAndUp(orcapicontroller.main.REQ_INPUTS) }
function accountRecovery (mode) { return AccountPolicy.accountRecovery(mode, orcapicontroller.main.REQ_INPUTS) }
module.exports = {
  async execute (req, res) {
    console.log('Account Management execute')
    orcapicontroller.main.httpRequest = req
    orcapicontroller.main.httpResponse = res
    const paramValidator = await orcapicontroller.preparams()
    let checkpoint = null
    if (paramValidator.isok) {
      // checkAccountStatus API
      if (orcapicontroller.main.REQ_CONTEX === AuthenticationController.options.CHECKACCOUNTSTATUS) {
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.onCheckAccountStatus) {
          accountStatus()
        } else if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.onGenerateAccountCode) {
          generateAccountCode()
        } else if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.onValidateAccountCode) {
          validateAccountCode()
        } else {
          responseSender({status: 400, output: {error: 'REQ_ACTION not found.', isok: false}})
        }
        return true
      }
      if (orcapicontroller.main.REQ_CONTEX === AuthenticationController.options.ACCOUNT_RECOVERY) {
        let mode = null
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.ACCOUNT_RECOVERY_EMAIL) {
          mode = 'email'
        }
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.ACCOUNT_RECOVERY_RESET) {
          mode = 'reset'
        }
        if (mode) {
          checkpoint = accountRecovery(mode)
        }
        if ((checkpoint && checkpoint.isok) || orcapicontroller.main.REQ_ACTION === AuthenticationController.options.ACCOUNT_RECOVERY_CODE) {
          passwordRecovery()
        } else {
          responseSender({status: 400, output: checkpoint})
        }
        return true
      }
      if (orcapicontroller.main.REQ_CONTEX === AuthenticationController.options.SIGNUP) {
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.NEW_SIGNUP) {
          checkpoint = validateSignInAndUp()
          if (checkpoint.isok) {
            signup()
          } else {
            responseSender({status: 400, output: checkpoint})
          }
          return true
        }
      }
      if (orcapicontroller.main.REQ_CONTEX === AuthenticationController.options.SIGNIN) {
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.ON_SIGNIN) {
          checkpoint = validateSignInAndUp()
          if (checkpoint.isok) {
            signin()
          } else {
            responseSender({status: 400, output: checkpoint})
          }
        } else if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.ON_SIGNOUT) {
          signout()
        } else {
          responseSender({status: 400, output: {error: 'orcapicontroller.main.REQ_ACTION not found'}})
        }
        return true
      }
      if (orcapicontroller.main.REQ_CONTEX === AuthenticationController.options.backoffice) {
        if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.backoffice_hardReset) {
          const _res = await backOfficeHardReset(orcapicontroller.main.REQ_INPUTS)
          if (_res) {
            console.log(_res)
          }
        } else if (orcapicontroller.main.REQ_ACTION === AuthenticationController.options.backoffice_removeAccount) {
          const {credentials, criteria} = orcapicontroller.main.REQ_INPUTS
          if (credentials && criteria) {
            const _res = await backOfficeRemoveAccount({credentials: credentials, criteria: criteria})
            if (_res) {
              console.log(_res)
            }
          } else {
            responseSender({status: 400, output: {error: 'orcapicontroller.main.REQ_ACTION credentials && criteria not found'}})
          }
        } else {
          responseSender({status: 400, output: {error: 'orcapicontroller.main.REQ_ACTION not found'}})
        }
        return true
      }
      if (orcapicontroller.main.REQ_CONTEX === CustomerController.options.CUSTOMER_PROFILE) {
        checkpoint = null
        if (orcapicontroller.main.REQ_ACTION === CustomerController.options.onFetchCustomerProfile) {
          checkpoint = await CustomerController.fechCustomerProfile(orcapicontroller.main)
          responseSender({status: (checkpoint.iook ? 200 : 400), output: checkpoint})
        } else if (orcapicontroller.main.REQ_ACTION === CustomerController.options.onUpdateCustomerProfile) {
          checkpoint = await CustomerController.updateCustomerProfile(orcapicontroller.main)
          responseSender({status: (checkpoint.iook ? 200 : 400), output: checkpoint})
        } else {
          responseSender({status: 400, output: {error: 'orcapicontroller.main.REQ_ACTION not found'}})
        }
        return true
      }
      if (orcapicontroller.main.REQ_CONTEX === 659832) {
        if (orcapicontroller.main.REQ_ACTION === 659832) {
          sendSMS(orcapicontroller.main.REQ_INPUTS)
        } else {
          responseSender({status: 400, output: {error: 'orcapicontroller.main.REQ_ACTION not found'}})
        }
        return true
      }
    }
    const error = (paramValidator.error && paramValidator.error.length !== 0) ? paramValidator.error : 'Não foi possivel concluir o pedido requerido. Por favor tente mais tarde. Obrigado.'
    responseSender({status: 500, output: {error: error}})
  }
}

async function signup () {
  try {
    const result = await AuthenticationController.signup(orcapicontroller.main.REQ_INPUTS)
    return responseSender(result)
  } catch (error) {
    console.log(error)
  }
}

async function signin () {
  try {
    const result = await AuthenticationController.signin(orcapicontroller.main.REQ_INPUTS)
    return responseSender(result)
  } catch (error) {
    console.log(error)
  }
}

async function signout () {
  const result = await AuthenticationController.signout(orcapicontroller.main)
  return responseSender(result)
}

async function passwordRecovery () {
  const result = await AuthenticationController.passwordRecovery(orcapicontroller.main)
  return responseSender(result)
}

async function accountStatus () {
  const result = await AuthenticationController.accountStatus(orcapicontroller.main)
  return responseSender(result)
}

async function generateAccountCode () {
  const result = await AuthenticationController.generateAccountCode(orcapicontroller.main)
  return responseSender(result)
}

async function validateAccountCode () {
  const result = await AuthenticationController.validateAccountCode(orcapicontroller.main)
  return responseSender(result)
}

async function backOfficeHardReset (credentials) {
  const result = await AuthenticationController.backOfficeHardReset(credentials)
  return responseSender(result)
}

async function backOfficeRemoveAccount (data) {
  const result = await AuthenticationController.backOfficeRemoveAccount(data)
  return responseSender(result)
}

function responseSender (result) {
  orcapicontroller.main.httpResponse.status(result.status).send(result.output)
  return result
}

async function sendSMS (credentials) {
  try {
    const buddySecret = require('../utils/SecretFriendSms')
    buddySecret.credentials(credentials.username, credentials.password)
    const contactsList = []
    contactsList.push({name: 'Oscar Campos', mobile: '+3519138'})
    contactsList.push({name: 'Melissa Martinez', mobile: '+3519123'})
    contactsList.push({name: 'João Campos', mobile: '+3519625'})
    contactsList.push({name: 'Alice Pires', mobile: '+3519254'})
    contactsList.push({name: 'Paulo Pires', mobile: '+3519122'})
    contactsList.push({name: 'Olga Pinho', mobile: '+3519184'})
    contactsList.push({name: 'Lucas Pires', mobile: '+3519279'})
    buddySecret.adicionarListaContactos(contactsList)
    buddySecret.setSmsTextTemplate('myfamily')
    const responses = await buddySecret.sentBulkSms()
    if (responses) {
      console.log(responses)
    }
    orcapicontroller.main.httpResponse.status(responses.status).send({result: responses.output})
  } catch (error) {
    console.log(error)
  }
  /**
  const BulkSMS = require('../utils/BulkSMS')
  const sms = new BulkSMS('', '')
  sms.send('+351913859014', 'teste', (err, result) => {
    if (err) {
      console.log(err)
      return false
    }
    console.log(result)
    return true
  })
  */
}
