const {SysAccounts, SysUser, SysAppContext, SysAccountsStatus, SysUserTypes} = require('../models')
const sysPolicy = require('../policies/SysPolicy')
const response = require('../utils/Utils')['resultOutput']
const emailSender = require('../controllers/orcmailer')
const uuid = require('uuid')

async function seedAuxModels (payload) {
    const {clear} = payload.REQ_INPUTS
    const dbcallback = (r) => r
    let logger = 'Seed aux db models: '
    if (clear) {
        const loggerResult = function (dbname, r) {
            console.log(dbname + ': ' +JSON.stringify(r))
            logger += '\n ' + dbname + ': ' +JSON.stringify(r)
        }
        let del = await SysAppContext.deleteMany({}).then(dbcallback).catch(dbcallback)
        loggerResult('SysAppContext', del)
        del = await SysAccountsStatus.deleteMany({}).then(dbcallback).catch(dbcallback)
        loggerResult('SysAccountsStatus', del)
        del = await SysUserTypes.deleteMany({}).then(dbcallback).catch(dbcallback)
        loggerResult('SysUserTypes', del)
    }
    let localtmp = new SysAppContext({label: 'sys-app', appContext: 606060})
    let test = await localtmp.save().then(dbcallback).catch(dbcallback)
    if (test.code === 11000) {
        console.log(test.message)
        logger += '\n SysAppContext ' + test.message
    }
    let datos = [{label: 'disabled', status: -100},{label: 'enable', status: 100},{label: 'onValidation', status: 200}]
    datos.forEach( async function (tf) {
        localtmp = new SysAccountsStatus(tf)
        test = await localtmp.save().then(dbcallback).catch(dbcallback)
        if (test.code === 11000) {
            console.log(test.message)
            logger += '\n SysAccountsStatus ' + test.message
        }
    })
    datos = [
        {label: 'admin', type: 1000},
        {label: 'user', type: 500},
        {label: 'guest', type: 100},
        {label: 'back-office', type: 2000},
        {label: 'tester', type: 3000}
    ]
    datos.forEach( async function (tf) {
        localtmp = new SysUserTypes(tf)
        test = await localtmp.save().then(dbcallback).catch(dbcallback)
        if (test.code === 11000) {
            console.log(test.message)
            logger += '\n SysUserTypes ' + test.message
        }
    })
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

async function createAccount (sysUserId, appContext) {
    //onValidation
    const accountStatus = 2000 
    const accountToken = tokenGenerator()
    const sysAccount = new SysAccounts({
        sysUserId: sysUserId,
        appContext: appContext,
        status: accountStatus,
        token: accountToken
    })
    const result = await sysAccount.save().then((r) => r).catch((r) => r)
    if (result.errors) {
        console.log(`Nao foi possivel criar a conta. ${result.errors}`)
    } 
    return response.resultOutputSuccess('New Account created success.')
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
                type: 500})
            const result = await user.save().then((r) => r).catch((r) => r)  
            if (result.errors || result.code === 11000) {
                let msg = result.message
                if (result.code === 11000) {
                    msg = msg.substring(msg.indexOf('index:'), msg.indexOf('dup key'))
                    if (msg) {
                        msg = msg.replace('index: ', '')
                        msg = msg.replace('_1 ', '')
                        msg = `O campo "${msg}" já se encontra registado.`
                    } 
                } else {
                    msg = 'Não foi possivel criar um registo. Verifique os dados ou entre em contacto com o Administrador.'
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
                    text = `Thanks for signing up at ${appContext.label}!\n`
                    text += `Thanks, \n`
                    text += `The ${appContext.label} Team \n`
                    sendMail(to, subject, text)
                }
                /* Create Account @end*/
            }
            return response.resultOutputSuccess('Registo foi concluído com sucesso. ')
        } else {
            return response.resultOutputError(`app-context "${payload.REQ_CONTEX}" not registered.`)
        }
    } else {
        return response.resultOutputError(validation.error)
    }
}

async function signin (payload) {
    return response.resultOutputError(signin)
}

const _instances = {
    signup: signup,
    signin: signin,
    seedauxmodels: seedAuxModels   
};

module.exports = _instances