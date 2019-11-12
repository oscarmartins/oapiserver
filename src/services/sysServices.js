const {SysAccounts, SysUser, SysAppContext, SysAccountsStatus, SysUserTypes} = require('../models')
const sysPolicy = require('../policies/SysPolicy')
const httpResponseUtils = require('../utils/Utils')
const jwt = httpResponseUtils.jwtToken
const response = httpResponseUtils.resultOutput
const emailSender = require('../controllers/orcmailer')
const uuid = require('uuid')

async function createAdminUser (appContext) {
    const email = httpResponseUtils.getEmail()
    const secret = httpResponseUtils.getSecret()
    let {user} = await SYS_HELPER.userQuery({email: email})
    if (user) {
        user = await SysAccounts.deleteOne({sysUserId: user._id, appContext: appContext}).then(async (r) => {
            const rmuser = await SysUser.deleteOne({email: email})
            return r
        }).catch((r) => r)
    } 
    user = await new SysUser({
        name: 'user admin', 
        email: email, 
        mobile: +111123456789,
        secret: secret, 
        type: sysPolicy.USER_TYPE_ADMIN
    }).save().then((r) => r).catch((r) => r)
    if (user) {
        createAccount(user._id, appContext)
    }
    return response.resultOutputSuccess('seed SysAdmin user created .')
}

async function createAccount (sysUserId, appContext) {
    //onValidation
    const accountStatus = sysPolicy.ACCOUNT_STATUS_ON_VALIDATION 
    const accountToken = tokenGenerator()
    const sysAccount = new SysAccounts({
        sysUserId: sysUserId,
        appContext: appContext,
        status: accountStatus,
        token: accountToken
    })
    const result = await sysAccount.save().then((r) => r).catch((r) => r)
    if (result.errors) {
        console.log(`Unable to create account. ${result.errors}`)
    } 
    return response.resultOutputSuccess('New Account created success.')
}

async function seedAuxModels (payload) {
    const {clear} = payload.REQ_INPUTS
    const dbcallback = (r) => r
    let logger = 'Seed aux db models: ', del, localtmp, test, datos
    if (clear) {
        const loggerResult = function (dbname, r) {
            logger += '\n ' + dbname + ': ' + (typeof r === 'object' ? JSON.stringify(r) : r)
        }
        del = await SysAppContext.deleteMany({}).then(dbcallback).catch(dbcallback)
        loggerResult('SysAppContext', del)
        del = await SysAccountsStatus.deleteMany({}).then(dbcallback).catch(dbcallback)
        logger += `\n SysAccountsStatus: ${JSON.stringify(del)}`
        del = await SysUserTypes.deleteMany({}).then(dbcallback).catch(dbcallback)
        logger += `\n SysUserTypes: ${JSON.stringify(del)}`
    }
    localtmp = new SysAppContext({label: 'sys-app', appContext: 606060})
    test = await localtmp.save().then(dbcallback).catch(dbcallback)
    if (test.code === 11000) {
        logger += `\n SysAppContext: ${test.message}`
    }
    datos = [
        {label: 'disabled', status: sysPolicy.ACCOUNT_STATUS_DISABLED},
        {label: 'enabled', status: sysPolicy.ACCOUNT_STATUS_ENABLED},
        {label: 'on_account_validation', status: sysPolicy.ACCOUNT_STATUS_ON_VALIDATION},
        {label: 'on_account_token_validation', status: sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION},
        {label: 'on_account_recovery_token_validation', status: sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION}
    ]
    datos.forEach( async function (tf) {
        localtmp = new SysAccountsStatus(tf)
        test = await localtmp.save().then(dbcallback).catch(dbcallback)
        if (test.code === 11000) {
            logger += `\n SysAccountsStatus: ${test.message}`
        }
    })
    datos = [
        {label: 'admin', type: sysPolicy.USER_TYPE_ADMIN},
        {label: 'user', type: sysPolicy.USER_TYPE_USER},
        {label: 'guest', type: sysPolicy.USER_TYPE_GUEST},
        {label: 'back-office', type: sysPolicy.USER_TYPE_BACK_OFFICE},
        {label: 'tester', type: sysPolicy.USER_TYPE_TESTER}
    ]
    datos.forEach( async function (tf) {
        localtmp = new SysUserTypes(tf)
        test = await localtmp.save().then(dbcallback).catch(dbcallback)
        if (test.code === 11000) {
            logger += `\n SysUserTypes: ${test.message}`
        }
    })
    test = await createAdminUser(payload.REQ_CONTEX)
    if (test) {
        logger += '\n createAdminUser done.'
    }
    return response.resultOutputSuccess(logger)
} 

const SYS_HELPER = {
    userQuery: async (query) => {
        const user = await SysUser.findOne(query)
        return {user}
    },
    accountQuery: async (query) => {
        const sysaccount = await SysAccounts.findOne(query)
        return {sysaccount}
    },
    isEmailRegistered: async (email) => {
        const {user} = await SYS_HELPER.userQuery({email: email})
        return (user && user.email === email)
    },
    userAccountByUserId: async (sysUserId, appContext) => {
        const {sysaccount} = await SYS_HELPER.accountQuery({sysUserId: sysUserId, appContext: appContext})
        const {user} = await SYS_HELPER.userQuery({_id: sysUserId})
        return {sysaccount, user}
    },
    userAccountByUserEmail: async (userEmail, appContext) => {
        const {user} = await SYS_HELPER.userQuery({email: userEmail})
        const {sysaccount} = await SYS_HELPER.accountQuery({sysUserId: user._id, appContext: appContext})
        return {user, sysaccount}
    },
    userUpdate: async (sysUser, queryUpdate) => {
        const criteria = {_id: sysUser._id, email: sysUser.email}
        Object.assign(queryUpdate, {dateUpdated: Date.now()})
        if (typeof queryUpdate.secret !== 'undefined') {
            queryUpdate.secret = SysUser.encryptPassword(queryUpdate.secret)
        }
        const result = await SysUser.updateOne(criteria, queryUpdate)
        return result
    },
    updateAccount: async (criteria, query) => {
        Object.assign(query, {dateUpdated: Date.now()})
        const update = await SysAccounts.updateOne(criteria, query)
        return update
    },
    changeAccountToken: async (tokenobj) => {
        const update = await SYS_HELPER.updateAccount({sysUserId: tokenobj.sysUserId, appContext: tokenobj.appContext}, {token: tokenGenerator()})
        if (update.ok && update.ok === 1 && update.nModified >= 1) {
            const emailtoken = await sendMailAccountVerificationToken(tokenobj.sysUserId, tokenobj.appContext)
            return emailtoken
        } else {
            return {
                msgerr: 'Error updateAccount.',
                isok: false
            }
        }
    },
    emailSysAccountModels: async (sysUserId, appContext) => {
        const {user, sysaccount} = await SYS_HELPER.userAccountByUserId(sysUserId, appContext)
        const appcontext = await SysAppContext.findOne({appContext: appContext})
        return {user, sysaccount, appcontext}
    },
    getSysEmailTemplate: async (sysUserId, appContext) => {
        const {user, sysaccount, appcontext} = await SYS_HELPER.emailSysAccountModels(sysUserId, appContext)
        let to, subject, html, text, msgerr, isok
        if (user) {
            isok = true
            to = user.email
            let hasSignature
            switch (sysaccount.status) {
                case sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION:
                case sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION:
                    hasSignature = true
                    if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION) {
                        subject = 'validation'
                        html = 'the verification'
                    } else {
                        subject = 'recovery'
                        html = 'email with the recovery'
                    }
                    subject = `account ${subject} token code - ${appcontext.label}`
                    html = `<p>We have sent you ${html} code for your account. </p> 
                            <p>You can copy and paste into the validation form the following code:</p>
                            <p><code style="margin-left: 100px;font-weight: bold;">${sysaccount.token}</code></p>`
                    break
                default:
                    hasSignature = true
                    subject = `request cannot be satisfied - ${appcontext.label}`
                    html = `<p>Hi ${user.name}.</p>
                            <p>Your request cannot be satisfied because your account status not correspond.</p>`
                    break
            }
            if (hasSignature) {
                html += `<p>Thanks,</p><p>The ${appcontext.label} Team</p>`
            }
        } else {
            isok = false
            msgerr = 'Error email not sent cause user not found.'
        }
        return {to, subject, html, text, msgerr, isok}
    }    
}

async function sendMail (to, subject, text, html) {
    emailSender.accountProfile = 'oscarafael_gmail'
    const result = await emailSender.sendMail({
        to: to, 
        subject: subject,
        text: text,
        html: html
    })
    if (result) {
        console.log('email enviado')
        return true
    }
    return false
}

async function sendEmailAccountTemplate (emailparam) {
    const outpreres = {
        msgerr: null,
        isok: false
    }
   
    outpreres.isok = await sendMail(emailparam.to, emailparam.subject, emailparam.text, emailparam.html)

    if (outpreres.isok) {
        
    } else {
        outpreres.msgerr = `Fail sent email! error id: ${emailparam.to} .`
    }
    return outpreres
}

async function sendMailAccountVerificationToken (sysUserId, appContext) {
    const {to, subject, html, text, msgerr, isok} = await SYS_HELPER.getSysEmailTemplate(sysUserId, appContext)
    if (isok) {
        const result = await sendEmailAccountTemplate({
            to: to,
            subject: subject,
            html: html
        })
        return result
    } else {
        return {
            msgerr: msgerr,
            isok: isok
        }
    }
}

async function tokenSessionVerify (payload) {
    let output = {
        sysUserId: null,
        appContext: null,
        msgerr: null,
        valid: false
    }
     const reqappcontext = await SysAppContext.findOne({appContext: payload.REQ_CONTEX})
     if (reqappcontext) {
        /* (request context VS (query appContext) VS request token param) */
        const jwtoken = jwt._tokenVerify(payload.httpRequest.headers.authorization)
        if (jwtoken.valid) {
            const {id, appContext} = jwtoken.valid
            output.valid = (id && appContext) && (appContext === reqappcontext.appContext)
            if (output.valid) {
               output.sysUserId = id
               output.appContext = appContext
            } else {
                output.msgerr = 'Error, invalid token session.'
            }
        } else {
            output.msgerr = jwtoken.errmsg
        }
     } else {
         output.msgerr = 'Error, Account not found.'
     }
     return output
}

function tokenGenerator () { return uuid() }

async function signup (payload) {
    const validation = sysPolicy.signup(payload.REQ_INPUTS)
    if (validation.isok) {
        const appContext = await SysAppContext.findOne({appContext: payload.REQ_CONTEX})
        if (appContext) {
            const {name, email, mobile, secret} = payload.REQ_INPUTS
            const user = new SysUser({
                name: name, 
                email: email, 
                mobile: mobile,
                secret: secret, 
                type: sysPolicy.USER_TYPE_USER
            })
            const result = await user.save().then((r) => r).catch((r) => r)  
            if (result.errors || result.code === 11000) {
                let msg = result.message
                if (result.code === 11000) {
                    msg = msg.substring(msg.indexOf('index:'), msg.indexOf('dup key'))
                    if (msg) {
                        msg = msg.replace('index: ', '')
                        msg = msg.replace('_1 ', '')
                        msg = `The field "${msg}" is already registered!`
                    } 
                } else {
                    msg = 'Not possible to create a new register. Please check the data or contact admin.'
                }
                return response.resultOutputError(msg)    
            } else {
                /* Create Account @begin*/
                const newAccount = await createAccount(user.id, appContext.appContext)
                if (!newAccount.iook) {
                    const removeuser = await user.remove({email: email})
                    if (removeuser) {
                        console.log('user removed!')
                    }
                    return response.resultOutputError(newAccount.error)    
                } else {
                    let to = user.email 
                    let subject = `Registration to ${appContext.label}`
                    let text = `Thanks for signing up at ${appContext.label}!\n`
                    text += `Thanks, \n`
                    text += `The ${appContext.label} Team \n`
                    sendMail(to, subject, text)
                }
                /* Create Account @end*/
            }
            return response.resultOutputSuccess('Registration has been successfully completed. ')
        } else {
            return response.resultOutputError(`app-context "${payload.REQ_CONTEX}" not registered.`)
        }
    } else {
        return response.resultOutputError(validation.error)
    }
}

async function signin (payload) {
    const validation = sysPolicy.signin(payload.REQ_INPUTS)
    let msgerr = null, 
        jwttoken = null
    if (validation.isok) {
        const {email, secret} = payload.REQ_INPUTS
        const {user} = await SYS_HELPER.userQuery({email: email})
        const goodlogin = user && await user.validPassword(secret).then((r) => {
            return r
        }).catch((err) => {
            return false
        })

        if (goodlogin) {
            console.log('good login!')
            const {sysaccount} = await SYS_HELPER.accountQuery({sysUserId: user.id, appContext: payload.REQ_CONTEX})
            if (sysaccount) {
                if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION) {
                    const criteria = {sysUserId: sysaccount.sysUserId, appContext: sysaccount.appContext}
                    const queryupd = {status: sysPolicy.ACCOUNT_STATUS_ON_VALIDATION, token: tokenGenerator()}
                    const update = await SYS_HELPER.updateAccount(criteria, queryupd)
                    if (update.ok && update.ok === 1 && update.nModified >= 1) {
                        console.log(`_> Account updated new status: ${sysPolicy.ACCOUNT_STATUS_ON_VALIDATION}`)
                    }
                }
                jwttoken = jwt.sessionToken({
                    id: user.id,
                    appContext: sysaccount.appContext
                })
            } else {
                msgerr = 'Error. Account problem.'
            }
        } else {
            /*Unauthorized*/
            console.log('Unauthorized!')
            msgerr = 'Error login unauthorized!'
        }
    } else {
        msgerr = validation.error
    }
    if (msgerr)
        return response.resultOutputError(msgerr)      
    return response.resultOutputDataOk({
        message: 'Login has been successfully!',
        token_session: jwttoken
    })
}

async function updateAccountStatus (sysAccount, newStatus) {
    const criteria = {sysUserId: sysAccount.sysUserId, appContext: sysAccount.appContext}
    const query = {status: newStatus}
    if (newStatus === sysPolicy.ACCOUNT_STATUS_ENABLED) 
        query.token = tokenGenerator()
    const update = await SYS_HELPER.updateAccount(criteria, query)
    if (update.ok && update.ok === 1 && update.nModified >= 1) {
        const {sysaccount} = await SYS_HELPER.accountQuery(criteria)
        const actions = await accountStatusActions(sysaccount)
        return actions
    } 
    return null
}

async function accountStatusActions (sysaccount) {
    let outpreres = {
        httpstatus: 200,
        action: '',
        msgerr: '',
        message: ''
    }
    switch (sysaccount.status) {
        case sysPolicy.ACCOUNT_STATUS_ENABLED:
            outpreres.action = 'enabled'
        break
        case sysPolicy.ACCOUNT_STATUS_ON_VALIDATION:
            outpreres.action = 'on_account_validation'
        break
        case sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION:
        case sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION:
            const emailsent = await sendMailAccountVerificationToken(sysaccount.sysUserId, sysaccount.appContext)
            if (emailsent.isok) {
                if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION) {
                    outpreres.action = 'on_account_token_validation'
                    outpreres.message = 'the verification'
                } else if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION) {
                    outpreres.action = 'on_account_recovery_token_validation'
                    outpreres.message = 'email with the recovery'
                }
                outpreres.message = `We have sent you ${outpreres.message} code for your account. `  
            } else {
                outpreres.httpstatus = 400
                outpreres.msgerr = emailsent.msgerr
            }
        break
        case sysPolicy.ACCOUNT_STATUS_DISABLED: 
        default:
            outpreres.httpstatus = 400
            outpreres.action = 'disabled'
        break
    }
    return outpreres
}

async function accountStatusVerification (sysAccount, payload) {
    const {token} = payload.REQ_INPUTS
    let httpstatus = 400, expect, msgerr, message, tmpaux
    switch (sysAccount.status) {
        case sysPolicy.ACCOUNT_STATUS_ENABLED:
            httpstatus = 200
            expect = 'enabled'
            break
        case sysPolicy.ACCOUNT_STATUS_ON_VALIDATION:
            /** change  account status */
            tmpaux = await updateAccountStatus(sysAccount, sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION)
            if (tmpaux) {
                httpstatus = tmpaux.httpstatus
                expect = tmpaux.action
                msgerr = tmpaux.msgerr
                message = tmpaux.message
            }
            break
        case sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION:
            if (typeof token === 'undefined') {
                msgerr = 'Bad request. token field is required.'
            } else {
                if (await sysAccount.validateToken(token).then((r)=> r).catch( () => false)) {
                    tmpaux = await updateAccountStatus(sysAccount, sysPolicy.ACCOUNT_STATUS_ENABLED)
                    if (tmpaux) {
                        httpstatus = tmpaux.httpstatus
                        expect = tmpaux.action
                        msgerr = tmpaux.msgerr
                        message = tmpaux.message
                    }
                } else {
                    msgerr = 'Invalid token code.'
                }
            }
            break
        case sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION:
            if (payload.REQ_ACTION === payload.apiPolicy.sysapp.accountrecovery) {
                //TODO
            } else {
                /*
                Se o req_action não for igual a accountrecovery, quer dizer que nao faz sentido que o status
                esteja a forçar a recuperacao da conta.
                Assim e por razões de segurança o status deve ser atualizado para on_account_token_validation.
                */
               tmpaux = await updateAccountStatus(sysAccount, sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION)
               if (tmpaux) {
                httpstatus = tmpaux.httpstatus
                expect = tmpaux.action
                msgerr = tmpaux.msgerr
                message = tmpaux.message
               }
            }
            break    
        case sysPolicy.ACCOUNT_STATUS_DISABLED:
        default:
            httpstatus = 400
            expect = 'disabled'
            msgerr = 'Account disabled.'
            break
    }
    return {
        httpstatus: httpstatus,
        expect: expect,
        msgerr: msgerr,
        message: message
    }
}

async function accountVerification (payload) {
    let nextStage = {to: 'login', message: null}
    const token_session = await tokenSessionVerify(payload)
    if (token_session.valid) {
        const {sysaccount} = await SYS_HELPER.accountQuery({sysUserId: token_session.sysUserId, appContext: token_session.appContext})
        if (sysaccount) {
            const preresponse = await accountStatusVerification(sysaccount, payload)
            if (preresponse.httpstatus === 200) {
                nextStage.message = preresponse.message
                console.log(`** Account Verification: expect:${preresponse.expect} vs 'enabled'`)
                if (preresponse.expect === 'enabled') {
                    nextStage.to = 'dashboard'
                } else if (preresponse.expect === 'on_account_token_validation') {
                    nextStage.to = 'account-validation'
                } 
            } else {
                nextStage.to = 'account-validation'
                nextStage.message = preresponse.msgerr
            }
            return response.resultOutputDataOk(nextStage)
        } else {
            nextStage.message = 'Error. Account problem.'
        }
    } else {
        nextStage.message = token_session.msgerr
    }
    return response.resultOutputDataError(nextStage)
}

async function requestAccountVerificationToken (payload) {
    let errmsg = null
    const token_session = await tokenSessionVerify(payload)
    if (token_session.valid) {
        const {sysaccount} = await SYS_HELPER.userAccountByUserId(token_session.sysUserId, token_session.appContext)
        if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_TOKEN_VALIDATION) {
            const emailtoken = await SYS_HELPER.changeAccountToken({sysUserId: sysaccount.sysUserId, appContext: sysaccount.appContext})
            if (emailtoken.isok) {
                return response.resultOutputSuccess('Success. Sent email account verification token. ')
            } else {
                errmsg = emailtoken.msgerr
            }
        } else {
            errmsg = 'The account status not permit execute this operation.'
        }
    } else {
        errmsg = token_session.msgerr
    }
    return response.resultOutputError(errmsg)
}
async function requestAccountRecoveryToken (payload) {
    let errmsg = null
    const emailvalidator = sysPolicy.accountRecovery(payload.REQ_INPUTS, 1)
    if (emailvalidator.isok) {
        const {email} = payload.REQ_INPUTS
        const {sysaccount} = await SYS_HELPER.userAccountByUserEmail(email, payload.REQ_CONTEX)
        if (sysaccount.status === sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION) {
            const emailtoken = await SYS_HELPER.changeAccountToken({sysUserId: sysaccount.sysUserId, appContext: sysaccount.appContext})
            if (emailtoken.isok) {
                return response.resultOutputSuccess('Success. Sent email account recovery token. ')
            } else {
                msgres = emailtoken.msgerr
            }
        } else {
            errmsg = 'The account status not permit execute this operation.'
        }
    } else {
        errmsg = emailvalidator.error
    }
    return response.resultOutputError(errmsg)
}
async function accountRecovery (payload) {
    /**  Stage 1 on_account_recovery 
     * > input field: email
     * [1] 
     *  · check email is registered √
     *  · check is user account is valid √
     * [2] change account status to: 'on_account_recovery_token_validation'
     * [3] change account token code
     * [4] sendEmail with account validation token 
     * < output: to view 'form-account-recovery'
     *     
     *   Stage 2 on_account_recovery_token_validation 
     * > input field: email, token, secret, confirmSecret 
     * [1] validate fields
     * [2] accountStatusVerification
     *  
     */
    const {email, token, secret, confirmSecret} = payload.REQ_INPUTS
    let errmsg, 
    nextStage = {
        to: 'account-recovery',
        message: ''
    },
    validation = sysPolicy.accountRecovery({email: email}, 1)
    if (validation.isok) {
        /*verificar se email se encontra registado */
        const isEmailRegistered = await SYS_HELPER.isEmailRegistered(email)        
        if (isEmailRegistered) {
            const {user, sysaccount} = await SYS_HELPER.userAccountByUserEmail(email, payload.REQ_CONTEX)
            /* verificar se este utilizador tem uma conta valida para esta aplicacao */
            if (sysaccount) {
                let updateAS = {
                    httpstatus: 400,
                    action: '',
                    msgerr: 'Error. accountRecovery updateAS !?!'
                }
                /*switch: default
                if (sysaccount.status !== sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION) {
                    updateAS = await updateAccountStatus(sysaccount, sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION)
                } 
                */
                switch (sysaccount.status) {
                    case sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION:
                        errmsg = null
                        validation = sysPolicy.accountRecovery({token: token, secret: secret, confirmSecret: confirmSecret}, 2)
                        if (validation.isok) {
                            const validateToken = await sysaccount.validateToken(token)
                            if (validateToken) {
                                const changeSecret = await SYS_HELPER.userUpdate(user, {secret: secret})
                                if (changeSecret) {
                                    updateAS = await updateAccountStatus(sysaccount, sysPolicy.ACCOUNT_STATUS_ENABLED)
                                }   else {
                                    errmsg = 'Error change secret ?!?'
                                }
                            } else {
                                errmsg = 'Invalid token code.'
                            }
                        } else {
                            errmsg = validation.error
                        }
                        if (errmsg) {
                            updateAS.msgerr = errmsg
                            updateAS.httpstatus = 400
                            updateAS.action = null
                        }
                        break
                    default:
                        updateAS = await updateAccountStatus(sysaccount, sysPolicy.ACCOUNT_STATUS_ON_RECOVERY_TOKEN_VALIDATION)
                        break
                }
                nextStage.to = 'account-recovery'
                if (updateAS.httpstatus === 200) {
                    if (updateAS.action === 'on_account_recovery_token_validation') {
                        nextStage.message = 'We have sent you an email with the recovery code for your account.'
                    } else if (updateAS.action === 'enabled') {
                        nextStage.message = 'The password has changed successfully.'
                    }
                    return response.resultOutputDataOk(nextStage)
                } else {
                    nextStage.message = updateAS.msgerr
                    return response.resultOutputDataError(nextStage)
                }
            } else {
                errmsg = 'The user account is not valid for this application.'
            } 
        } else {
            errmsg = 'Email is not registered.'
        } 
    } else {
        errmsg = validation.error
    }
    return response.resultOutputError(errmsg)
}

const _instances = {
    signup: signup,
    signin: signin,
    accountverification: accountVerification,
    seedauxmodels: seedAuxModels,
    requestaccountverificationtoken: requestAccountVerificationToken,
    requestaccountrecoverytoken: requestAccountRecoveryToken,
    accountrecovery: accountRecovery   
}

module.exports = _instances