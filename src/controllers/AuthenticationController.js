const User = require('../models/User')
const AccountManager = require('../utils/AccountManager')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function _resolveResponse (res, result) {
  if (result.status === 200) {
    res.send(result.output)
  } else {
    res.status(result.status).send(result.output)
  }
}

function jwtSignUser (user) {
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: '30m'
  })
}

async function _signup (payload) {
  try {
    const {email, password, name} = payload
    const user = await User.findOne({'email': email}, {'email': 1, password: 1})
    if (user) {
      return {
        status: 400,
        output: {error: 'This email account is already in use'}
      }
    } else {
      var newUser = new User()
      newUser.name = name || email.split('@')[0]
      newUser.email = email
      newUser.password = newUser.encryptPassword(password)
      const result = await newUser.save()
      if (result) {
        const msg = 'Your registration has been successfully completed. Redirect to Sign In...'
        const result = await AccountManager.createNewAccount(newUser)
        if (result.iook) {
          return {
            status: 200,
            output: {message: msg, success: result.success}
          }
        } else {
          return {
            status: 400,
            output: {error: result.error}
          }
        }
      } else {
        console.log('register fail')
        return {
          status: 400,
          output: {error: 'error register fail.'}
        }
      }
    }
  } catch (err) {
    return {
      status: 400,
      output: {error: err}
    }
  }
}
/**
 * 
 * @param {*} payload 
 * 
 * return {
 *   status: number,
 *   output: {}
 * }
 */
async function _signin (payload) {
  try {
    const {email, password} = payload
    const filter = {'email': 1, password: 1}
    const result = await User.findOne({email: email}, filter)
    if (!result) {
      return {
        status: 403,
        output: {error: 'The login info was incorrect.'}
      }
    } else {
      const isPasswordValid = await result.validPassword(password)
      if (!isPasswordValid) {
        return {
          status: 403,
          output: {
            error: 'The login info was incorrect [email or password]'
          }
        }
      } else {
        // check account status
        const checkAccountStatus = await AccountManager.checkAccountStatus(AccountManager.mode.Signin, result)
        if (checkAccountStatus) {
          const accountStatus = checkAccountStatus.accountStatus
          const onRequiredHumanHand = (checkAccountStatus.status === 400 &&
            accountStatus.as === AccountManager.options.onAccountValidation &&
            accountStatus.ns === AccountManager.options.onAccountValidationCode &&
            accountStatus.mode === AccountManager.mode.Signin)
          if (checkAccountStatus.status === 200 || onRequiredHumanHand) {
            const usrJson = result.toJSON()
            const theToken = jwtSignUser(usrJson)
            checkAccountStatus.output = {
              profile: usrJson,
              access_token: theToken,
              message: accountStatus.message || 'signin ok'
            }
            if (onRequiredHumanHand) {
              return {
                status: 200,
                output: checkAccountStatus.output
              }
            }
          } else {
            /**
             * BUG::BACKDOOR ?
             * -> if checkAccountStatus.status !== 200
             * -> only return status:200
             * --> accountStatus: {
                    as:10000
                    message:"Validar Código de Segurança"
                    mode:"Signin"
                    ns:11000
             *    }
             *[CODE]
              const usrJson = result.toJSON()
              const theToken = jwtSignUser(usrJson)
              return {
                status: 200,
                output: {
                  profile: usrJson,
                  access_token: theToken,
                  message: 'signin ok'
                }
              }
             * 
             */

          }
        } else {
          console.log('error')
        }
        return checkAccountStatus
      }
    }
  } catch (err) {
    return {
      status: 500,
      output: {error: 'An error has occured trying to login'}
    }
  }
}

async function _signout (main) {
  try {
    const logout = await main.httpRequest.session.destroy()
    if (logout) {
      return {
        status: 200,
        output: {
          profile: null,
          access_token: null,
          message: 'signout yes'
        }
      }
    }
  } catch (err) {
    console.log(err)
    return {
      status: 500,
      output: {error: 'An error has occured trying to signout'}
    }
  }
}
/**
 * todo
 * primeiro post --> require email
 * segundo post --> require email & code
 * terceiro post --> require email & code & password & passwordConfirm
 * 
 * @param {*} payload 
 */
async function _passwordRecovery (payload) {
  try {
    let checkAccountStatus = null
    let accountUser = null
    let accountResult
    const {email, code, password, confirmPassword} = payload.REQ_INPUTS
    accountUser = await AccountManager.checkAccountEmail(email)
    if (accountUser) {
      console.log('DEBUG _passwordRecovery.checkAccountEmail [email checked]')
      if (payload.REQ_ACTION === AccountManager.options.ACCOUNT_RECOVERY_EMAIL) {
        accountResult = await AccountManager.changeAccountNextStageByUser(accountUser, AccountManager.options.onPasswordRecoveryCode)
        if (accountResult.iook) {
          console.log('DEBUG changeAccountNextStageByUser [account Stage changed to onPasswordRecoveryCode = ' + AccountManager.options.onPasswordRecoveryCode + ']')
          const optionmail = {
            email: accountUser.email,
            accountStatus: accountResult.data.accountStatus,
            nextStage: accountResult.data.nextStage
          }
          const emailAccountCode = await AccountManager.sendPredefinedMail(optionmail)
          if (emailAccountCode.iook) {
            console.log('DEBUG sendPredefinedMail [' + emailAccountCode.success + ']')
          } else {
            console.log('ERROR sendPredefinedMail [' + emailAccountCode.error + ']')
            throw new Error(emailAccountCode.error)
          }
        } else {
          console.log('ERROR changeAccountNextStageByUser [' + accountResult.error + ']')
          throw new Error(accountResult.error)
        }
      }
      if (payload.REQ_ACTION === AccountManager.options.ACCOUNT_RECOVERY_CODE || payload.REQ_ACTION === AccountManager.options.ACCOUNT_RECOVERY_RESET) {
        if (code) {
          const codeValidator = await AccountManager.codeValidator(accountUser, code)
          if (codeValidator.iook) {
            console.log('DEBUG codeValidator [código valido!!!}')
          } else {
            console.log('ERROR codeValidator [' + codeValidator.error + ']')
            throw new Error(codeValidator.error)
          }
        } else {
          throw new Error('O codigo de segurança que indicou não está correcto.')
        }
      }
      if (payload.REQ_ACTION === AccountManager.options.ACCOUNT_RECOVERY_CODE) {
        accountResult = await AccountManager.changeAccountNextStageByUser(accountUser, AccountManager.options.onPasswordRecoveryChange)
        if (accountResult.iook) {
          console.log('DEBUG changeAccountNextStageByUser [' + accountResult.success + ']')
        } else {
          console.log('ERROR codeValidator [' + accountResult.error + ']')
          throw new Error(accountResult.error)
        }
      }
      if (payload.REQ_ACTION === AccountManager.options.ACCOUNT_RECOVERY_RESET) {
        if ((password && confirmPassword) || password === confirmPassword) {
          const resetPassword = await AccountManager.resetPassword(accountUser, code, password)
          if (resetPassword.iook) {
            accountResult = await AccountManager.activateAccountAction(accountUser, code)
            if (accountResult.iook) {
              console.log('DEBUG activateAccountAction [' + accountResult.success + ']')
            } else {
              console.log('ERROR activateAccountAction [' + accountResult.error + ']')
              throw new Error(accountResult.error)
            }
          } else {
            console.log('ERROR resetPassword [' + resetPassword.error + ']')
            throw new Error(resetPassword.error)
          }
        } else {
          throw new Error('As password´s não estão correctas. Por favor verifique se esta a indicar as password´s iguais.')
        }
      }
      checkAccountStatus = await AccountManager.checkAccountStatus(AccountManager.mode.PasswordRecovery, accountUser)
      if (checkAccountStatus) {
        return checkAccountStatus
      } else {
        throw new Error('nao foi possivel determinar o estado da conta.')
      }
    } else {
      throw new Error('O email que indicou não está registado.')
    }
  } catch (error) {
    console.log('Error: ' + error)
    return {
      status: 500,
      output: {error: error.message || 'An error has occured trying to passwordRecovery'}
    }
  }
}

async function _accountStatus (payload) {
  try {
    const {email} = payload.REQ_INPUTS
    const accountUser = await AccountManager.fetchAccountStatus(email)
    return accountUser
  } catch (error) {
    console.log('Error: ' + error)
    return {
      status: 500,
      output: {error: error.message || 'An error has occured trying to check account status'}
    }
  }
}

async function _generateAccountCode (payload) {
  try {
    const {email} = payload.REQ_INPUTS
    if (email) {
      const accountNext = await AccountManager.changeAccountNextStageByEmail(email, AccountManager.options.onGenerateAccountCode)
      if (accountNext.iook) {
        await AccountManager.notificator.sendSecurityCodeByEmail(email, 300, accountNext.data.code)
        return {
          status: 200,
          output: {
            data: accountNext,
            success: 'Foi enviado para o teu email o código de segurança.'
          }
        }
      } else {
        throw new Error(accountNext.error)
      }
    } else {
      throw new Error('The email is not valid!! Check the email.')
    }
  } catch (error) {
    console.log('Error: ' + error)
    return {
      status: 500,
      output: {error: error.message || 'An error has occured trying to check account status'}
    }
  }
}

async function _validateAccountCode (payload) {
  try {
    let varTmp = null
    const {user, code} = payload.REQ_INPUTS
    if (user.email && code) {
      varTmp = await AccountManager.checkAccountEmail(user.email)
      if (varTmp) {
        varTmp = await AccountManager.codeValidator(varTmp, code)
        if (varTmp && varTmp.iook) {
          varTmp = await AccountManager.activateAccountAction(user, code)
          if (varTmp && varTmp.iook) {
            return {
              status: 200,
              success: varTmp.success
            }
          } else {
            throw new Error(varTmp.error)
          }
        } else {
          throw new Error(varTmp.error)
        }
      }
    }
  } catch (error) {
    return {
      status: 500,
      output: {error: error.message || 'An error has occured trying to check account status'}
    }
  }
}

module.exports = {
  options: AccountManager.options,
  async signup (payload) {
    const result = await _signup(payload)
    return result
  },
  async signin (payload) {
    const result = await _signin(payload)
    return result
  },
  async signout (main) {
    const result = await _signout(main)
    return result
  },
  async passwordRecovery (main) {
    const result = await _passwordRecovery(main)
    return result
  },
  async accountStatus (main) {
    const result = await _accountStatus(main)
    return result
  },
  async generateAccountCode (main) {
    const result = await _generateAccountCode(main)
    return result
  },
  async validateAccountCode (main) {
    const result = await _validateAccountCode(main)
    return result
  },
  async backOfficeHardReset (credentials) {
    const resout = {status: 200, output: {error: '', success: ''}}
    try {
      const accountBackoffice = await AccountManager.backoffice.hardReset(credentials)
      if (accountBackoffice.iook) {
        resout.output.success = accountBackoffice.success
        if (accountBackoffice.data) {
          resout.output.data = accountBackoffice.data
        }
      } else {
        throw new Error(accountBackoffice.error)
      }
    } catch (error) {
      resout.status = 400
      resout.output.error = error.message
    }
    return resout
  },
  async backOfficeRemoveAccount (data) {
    const resout = {status: 200, output: {error: '', success: ''}}
    try {
      const accountBackoffice = await AccountManager.backoffice.removeAccount(data)
      if (accountBackoffice.iook) {
        resout.output.success = accountBackoffice.success
        if (accountBackoffice.data) {
          resout.output.data = accountBackoffice.data
        }
      } else {
        throw new Error(accountBackoffice.error)
      }
    } catch (error) {
      resout.status = 400
      resout.output.error = error.message
    }
    return resout
  },
  async logout (req, res) {
    try {
      req.session.destroy(function (err) {
        if (err) {
          console.log('### erro ao destruir sessão')
          return res.status(400).send({
            error: err
          })
        }
        return res.status(200).send({success: 1})
      })
    } catch (err) {
      return res.status(400).send({
        error: err
      })
    }
  },
  async login (req, res) {
    try {
      const result = await _signin(req.body)
      _resolveResponse(res, result)
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to login'
      })
    }
  }
}
