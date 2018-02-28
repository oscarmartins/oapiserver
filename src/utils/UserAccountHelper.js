const User = require('../models/User')
const Accounts = require('../models/Accounts')
const EmailSender = require('../controllers/orcmailer')
const uuid = require('uuid')
const _session = {_userAdmin: null, _userSession: null, _userSecret: null}
EmailSender.accountProfile = 'accounts_notificator'

let loggerinsta = null

async function removeUser (data) {
  try {
    const user = await User.find(data).then(function (usr) {
      if (usr.length !== 1) {
        throw new Error('removeUser inconsistencia dos dados user ')
      }
      return usr[0]
    }).catch(function (err) {
      return err
    })
    await User.findByIdAndRemove(user._id, function (err, doc) {
      if (err) {
        throw err
      }
      return doc
    })
    return instance.resultOutputDataOk(user)
  } catch (error) {
    return instance.resultOutputError(error.message)
  }
}

async function removeAccount (user) {
  try {
    const account = await Accounts.find({user_id: user._id}).then(function (act) {
      if (act.length !== 1) {
        throw new Error('removeAccount inconsistencia dos dados account ')
      }
      return act[0]
    }).catch(function (err) {
      return err
    })
    await Accounts.findByIdAndRemove(account._id, function (err, doc) {
      if (err) {
        throw err
      }
      return doc
    })
    return instance.resultOutputDataOk(user)
  } catch (error) {
    return instance.resultOutputError(error.message)
  }
}

function loggerDebugClear () {
  loggerinsta = null
}

function loggerDebug (buffer) {
  let serial = ''
  if (loggerinsta == null) {
    loggerinsta = serial
    serial = ' [{{serial}}]'
  }
  loggerinsta += (`${serial} {{buffer}}`).replace(new RegExp('{{serial}}', 'g'), _session._userSession).replace('{{buffer}}', buffer)
}

function loggerResume () {
  console.log(loggerinsta += ('[{{serial}}]').replace(new RegExp('{{serial}}', 'g'), _session._userSession))
  return loggerinsta
}

function resultOutput (iook, success, error, data) {
  var log = `UserAccountHelper DEBUG::begin iook = ${iook} success = ${success} error = ${error} data = ${data} DEBUG::end UserAccountHelper`
  loggerDebug(log)
  return {
    iook: iook,
    success: success,
    error: error,
    data: data || null
  }
}

async function removeUsersAll () {
  loggerDebug('removeUsersAll begin')
  let usersEraseAll = null
  const output = instance.resultOutputSuccess(null)
  try {
    usersEraseAll = await User.find().then(function (usr) {
      return usr
    }).catch(function (err) {
      return err
    })
    if (usersEraseAll instanceof Array) {
      for (let user of usersEraseAll) {
        await User.findByIdAndRemove(user._id, function (err, doc) {
          if (err) {
            loggerDebug(err)
          }
          return doc
        })
      }
    } else {
      loggerDebug('removeUsersAll error type')
    }
    loggerDebug('removeUsersAll end')
    output.success = `Foram removidos [${usersEraseAll.length}] registos.`
    output.data = {users: usersEraseAll, logger: loggerResume()}
    loggerDebug(output.success)
  } catch (error) {
    return instance.resultOutputError(error)
  }
  return output
}

async function removeAccountsAll () {
  loggerDebug('removeAccountsAll begin')
  let accountEraseAll = null
  const output = instance.resultOutputSuccess(null)
  try {
    accountEraseAll = await Accounts.find().then(function (act) {
      return act
    }).catch(function (err) {
      return err
    })
    if (accountEraseAll instanceof Array) {
      for (let account of accountEraseAll) {
        await Accounts.findByIdAndRemove(account._id, function (err, doc) {
          if (err) {
            loggerDebug(err)
          }
          return doc
        })
      }
    } else {
      throw new Error(`accountSecureReset() => erro removeAccountsAll() ${'error type'}`)
    }
    loggerDebug('removeAccountsAll end')
    output.success = `Foram removidos [${accountEraseAll.length}] registos.`
    output.data = {account: accountEraseAll, logger: loggerResume()}
    loggerDebug(output.success)
  } catch (error) {
    loggerDebug(error)
    return instance.resultOutputError(error)
  }
  return output
}

function fetchCredentials () {
  /** static mode */
  const jwtSecret = require('/opt/orccontext')['jwtSecret']
  return {credential: '111110000000000', passport: 12345678, secret: jwtSecret}
}

function authenticator (userAdmin) {
  try {
    instance.clearSession()
    const {credential, passport, secret} = userAdmin
    if (!credential || !passport || !secret) {
      throw new Error('parametros de autenticacao invalidos!!!')
    }
    if (((fetchCredentials().credential === credential && fetchCredentials().passport === passport))) {
      if (fetchCredentials().secret !== secret) {
        throw new Error('chave secreta invalida!!')
      }
      instance._userAdmin = `${credential}`
      _session._userAdmin = instance._userAdmin
      _session._userSession = uuid()
      instance._userSession = _session._userSession
      return true
    } else {
      throw new Error('os dados de autenticacao nao estao invalidos!!')
    }
  } catch (error) {
    loggerDebug(error)
  }
  return false
}

const instance = {
  _userAdmin: null,
  _userSession: null,
  _onSession: () => {
    return (instance._userAdmin === _session._userAdmin && instance._userSession === _session._userSession)
  },
  clearSession: () => {
    instance._userAdmin = null
    instance._userAdmin = null
    _session._userAdmin = uuid()
    _session._userSession = uuid()
    loggerDebugClear()
  },
  resultOutputSuccess: (success) => { return resultOutput(true, success, null, null) },
  resultOutputError: (error) => { return resultOutput(false, null, error, null) },
  resultOutputDataOk: (data) => { return resultOutput(true, null, null, data) },
  resultOutputDataError: (data) => { return resultOutput(false, null, null, data) },
  authenticator: (useradmin) => {
    try {
      return authenticator(useradmin)
    } catch (error) {
      loggerDebug(error)
    }
    return false
  },
  accountSecureReset: async function (data) {
    var validator = null
    try {
      if (instance.authenticator(data)) {
        if (instance._onSession()) {
          let validatorTmp = null
          validator = await removeUsersAll()
          if (validator.iook) {
            validatorTmp = validator
            loggerDebugClear()
            validator = await removeAccountsAll()
            if (validator.iook) {
              const outobj = instance.resultOutputSuccess('operacao concluida com sucesso!')
              outobj.data = {
                users: {
                  success: validatorTmp.success,
                  data: validatorTmp.data
                },
                accounts: {
                  success: validator.success,
                  data: validator.data
                }
              }
              return outobj
            } else {
              throw new Error(`accountSecureReset() => erro removeAccountsAll() ${validator.error}`)
            }
          } else {
            throw new Error(`accountSecureReset() => erro removeUsersAll() ${validator.error}`)
          }
        } else {
          throw new Error('accountSecureReset() => erro ao verificar sessao.')
        }
      } else {
        throw new Error('accountSecureReset() => erro ao autenticar utilizador.')
      }
    } catch (error) {
      loggerDebug(error)
      return instance.resultOutputError(loggerResume())
    }
  },
  /**
   * data = {
   *    credentials: {credential: '111110000000000', passport: 12345678, secret: jwtSecret},
   *    criteria: {user_id: '', email: ''}
   * }
   */
  accountProfileReset: async function (data) {
    var validator = null
    var emailTo = null
    var username = null
    try {
      const {credentials, criteria} = data
      if (!credentials || !criteria) {
        throw new Error('accountProfileReset() => erro argumentos em falta <= !credentials || !criteria')
      } else if (instance.authenticator(data.credentials)) {
        if (instance._onSession()) {
          validator = await removeUser(data.criteria)
          if (validator.iook) {
            emailTo = validator.data.email
            username = validator.data.name
            validator = await removeAccount(validator.data)
            if (!validator.iook) {
              throw new Error(`accountProfileReset() removeAccount => ${validator.error} <= `)
            }
          } else {
            throw new Error(`accountProfileReset() removeUser => ${validator.error} <= `)
          }
          console.log(validator)
          const mailOptions = {
            to: emailTo, // list of receivers
            subject: 'Account Deleted    ✔✔', // Subject line
            html: `Hello, <b>${username || emailTo}</b><p>Your account was permanently deleted.<br> Hope to see you back soon!</p>` // html body
          }
          await EmailSender.sendMail(mailOptions)
          return instance.resultOutputSuccess('Conta removida com sucesso.')
        } else {
          throw new Error('accountProfileReset() => _onSession fail <= ')
        }
      } else {
        throw new Error('accountProfileReset() => authenticator fail <= ')
      }
    } catch (err) {
      loggerDebug(err.message)
      return instance.resultOutputError(err.message)
    }
  }
}

module.exports = instance
