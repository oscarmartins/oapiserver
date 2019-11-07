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
    let admin = await SysUser.findOne({email: email})
    if (admin) {
        admin = await SysAccounts.deleteOne({sysUserId: admin._id, appContext: appContext}).then(async (r) => {
            const rmuser = await SysUser.deleteOne({email: email})
            return r
        }).catch((r) => r)
        //admin = await SysUser.remove({email: email})
    } 
    admin = await new SysUser({
        name: 'user admin', 
        email: email, 
        mobile: +111123456789,
        secret: secret, 
        type: 1000
    }).save().then((r) => r).catch((r) => r)
    if (admin) {
        createAccount(admin._id, appContext)
    }
    return response.resultOutputSuccess('seed SysAdmin user created .')
}

async function createAccount (sysUserId, appContext) {
    //onValidation
    const accountStatus = 200 
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
        {label: 'on_account_token_validation', status: sysPolicy.ACCOUNT_STATUS_ON_VALIDATION},
        {label: 'on_account_recovery_token_validation', status: 400}
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

function tokenGenerator () { return uuid() }

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
                type: 500
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
    let msgerr = null
    let jwttoken = null
    if (validation.isok) {
        let goodlogin = false
        const appContext = await SysAppContext.findOne({appContext: payload.REQ_CONTEX})
        if (appContext) {
            const {email, secret} = payload.REQ_INPUTS
            const result = await SysUser.findOne({email: email})
            goodlogin = (result && result.validPassword(secret))
            if (goodlogin) {
                console.log('good login!')
                jwttoken = jwt.sessionToken({
                    id: result.id,
                    appContext: appContext.appContext
                })
            } 
        } 
        if (!goodlogin) {
            /*Unauthorized*/
            msgerr = 'Login error. Wrong data.'
            if (appContext == null || typeof appContext === 'undefined') {
                console.log('sent email to admin. Not found app context.')
            }
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

/* 
criteria = {
    sysUserId: sysAccount.sysUserId, 
    appContext: sysAccount.appContext
} 
*/
async function accountStatusActions (sysaccount) {
    let outpreres = {
        httpstatus: 200,
        action: '',
        msgerr: ''
    }
    switch (sysaccount.status) {
        case 100:
            outpreres.action = 'enabled'
        break;
        case 200:
            outpreres.action = 'on_account_validation'
        break;
        case 300:
            const emailsent = await sendMailAccountVerificationToken(sysaccount.sysUserId, sysaccount.appContext)
            if (emailsent.isok) {
                outpreres.action = 'on_account_token_validation'
            } else {
                outpreres.httpstatus = 400
                outpreres.msgerr = emailsent.msgerr
            }
        break;
        case -100: 
        default:
            outpreres.httpstatus = 400
            outpreres.action = 'disabled'
        break;
    }
    return outpreres
}

async function sendMailAccountVerificationToken (sysUserId, appContext) {
    const outpreres = {
        msgerr: null,
        isok: false
    }
    const sysaccount = await SysAccounts.findOne({sysUserId: sysUserId, appContext: appContext})
    const appcontext = await SysAppContext.findOne({appContext: appContext})
    const user = await SysUser.findOne({_id: sysUserId})
    if (user) { 
        let to = user.email 
        let subject = `Account validation token code - ${appcontext.label}`
        let html = `<p>We have sent you the verification code for your account.</p>`
        html += `<p>You can copy and paste into the validation form the following code:</p>`
        html += `<p><code style="margin-left: 100px;">${sysaccount.token}</code></p>`
        html += `<p>Thanks,</p>`
        html += `<p>The ${appcontext.label} Team</p>`
        outpreres.isok = await sendMail(to, subject, null, html)
        if (outpreres.isok) {
            
        } else {
            outpreres.msgerr = `Fail sent email! error id: ${user._id} ${appcontext.label}.`
        }
    } else {
        outpreres.msgerr = `User not found! id: ${sysaccount.sysUserId} ${appcontext.label}`
    }
    return outpreres
}

async function updateAccount (criteria, query) {
    const update = await SysAccounts.updateOne(criteria, query)
    return update
}

async function updateAccountStatus (sysAccount, newStatus) {
    const criteria = {sysUserId: sysAccount.sysUserId, appContext: sysAccount.appContext}
    const query = {status: newStatus, dateUpdated: Date.now()}
    if (newStatus === 100) query.token = tokenGenerator()
    const update = await updateAccount(criteria, query)
    if (update.ok && update.ok === 1 && update.nModified >= 1) {
        const sysaccount = await SysAccounts.findOne(criteria)
        const actions = await accountStatusActions(sysaccount)
        return actions
    } 
    return null
}

async function accountStatusVerification (sysAccount, payload) {
    const {token} = payload.REQ_INPUTS
    let httpstatus = 400, expect, msgerr, tmpaux
    switch (sysAccount.status) {
        case 100:
            httpstatus = 200
            expect = 'enabled'
            break;
        case 200:
            /** change  account status */
            tmpaux = await updateAccountStatus(sysAccount, 300)
            /*
                action:"on_account_token_validation"
                httpstatus:200
            */
            if (tmpaux) {
                httpstatus = tmpaux.httpstatus
                expect = tmpaux.action
                msgerr = tmpaux.msgerr
            }
            break;
        case 300:
            if (typeof token === 'undefined') {
                msgerr = 'Bad request. token field is required.'
            } else {
                if (token === sysAccount.token) {
                    tmpaux = await updateAccountStatus(sysAccount, 100)
                    if (tmpaux) {
                        httpstatus = tmpaux.httpstatus
                        expect = tmpaux.action
                        msgerr = tmpaux.msgerr
                    }
                } else {
                    msgerr = 'Invalid token code.'
                }
            }
            break;
        case 400:
            if (payload.REQ_ACTION === payload.apiPolicy.sysapp.accountrecovery) {
                
            } else {
                /*
                Se o req_action não for igual a accountrecovery, quer dizer que nao faz sentido que o status
                esteja a forçar a recuperacao da conta.
                Assim e por razões de segurança o status deve ser atualizado para on_account_token_validation.
                */
               tmpaux = await updateAccountStatus(sysAccount, 300)
               if (tmpaux) {
                httpstatus = tmpaux.httpstatus
                expect = tmpaux.action
                msgerr = tmpaux.msgerr
               }
            }
            break;    
        case -100:
        default:
            httpstatus = 400
            expect = 'disabled'
            msgerr = 'Account disabled.'
            break;
    }
    return {
        httpstatus: httpstatus,
        expect: expect,
        msgerr: msgerr
    }
}

async function accountRecovery (payload) {
    /**  Stage 1 on_account_recovery 
     * > input field: email
     * [1] check if email is registered
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
    let errmsg = null,
    validation = sysPolicy.accountRecovery(payload.REQ_INPUTS, 1)
    if (validation.isok) {
        let {email, token, secret, confirmSecret } = payload.REQ_INPUTS
        const user = await SysUser.findOne({email: email})
        if (user) {
            const sysaccount = await SysAccounts.findOne({sysUserId: user._id, appContext: payload.REQ_CONTEX})
            if (sysaccount) {

            }
        } else {
            errmsg = ''
        } 
    } else {
        errmsg = validation.error
    }
    
    return response.resultOutputSuccess(``)
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

async function accountverification (payload) {
    let outputErr = null
    const token_session = await tokenSessionVerify(payload)
    if (token_session.valid) {
        const sysaccount = await SysAccounts.findOne({sysUserId: token_session.sysUserId, appContext: token_session.appContext})
        if (sysaccount) {
            const preresponse = await accountStatusVerification(sysaccount, payload)
            if (preresponse.httpstatus === 200) {
                let nextStage = {to: 'login'}
                console.log(`** Account Verification: expect:${preresponse.expect} vs 'enabled'`)
                if (preresponse.expect === 'enabled') {
                    nextStage.to = 'dashboard'
                } else if (preresponse.expect === 'on_account_token_validation') {
                    nextStage.to = 'account-validation'
                } 
                return response.resultOutputDataOk(nextStage)
            } else {
                outputErr = preresponse.msgerr
            }
        } else {
            outputErr = 'Bad Request parameters'
        }
    } else {
        outputErr = token_session.msgerr
    }
    return response.resultOutputError(outputErr) 
}

async function requestAccountVerificationToken (payload) {
    let msgres = null
    const token_session = await tokenSessionVerify(payload)
    if (token_session.valid) {
        const criteria = {sysUserId: token_session.sysUserId, appContext: token_session.appContext}
        const query = {token: null, dateUpdated: Date.now()}
        query.token = tokenGenerator()
        const update = await updateAccount(criteria, query)
        if (update.ok && update.ok === 1 && update.nModified >= 1) {
            const emailtoken = await sendMailAccountVerificationToken(token_session.sysUserId, token_session.appContext)
            if (emailtoken.isok) {
                return response.resultOutputSuccess('Sent email account verification token. Success.')
            } else {
                msgres = emailtoken.msgerr 
            }
        } else {
            msgres = 'Error updateAccount.'
        }
    } else {
        msgres = token_session.msgerr
    }
    return response.resultOutputError(msgres)
}

const _instances = {
    signup: signup,
    signin: signin,
    accountverification: accountverification,
    seedauxmodels: seedAuxModels,
    requestaccountverificationtoken: requestAccountVerificationToken,
    accountrecovery: accountRecovery   
};

module.exports = _instances