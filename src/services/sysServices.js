const {SysAccounts, SysUser, SysAppContext, SysAccountsStatus, SysUserTypes} = require('../models')
const sysPolicy = require('../policies/SysPolicy')
const response = require('../utils/Utils')['resultOutput']

async function seedAuxModels () {
    let localtmp = new SysAppContext({label: 'adminSys', appContext: 1572475714900})
    let test = await localtmp.save().then(function (a) {
        return a
    }).catch(function(error){
    return error 
    })
    if (test.code === 11000) {
        console.log(test.message)
    }
    let datos = [{label: 'disabled', status: -100},{label: 'enable', status: 100},{label: 'onValidation', status: 200}]
    datos.forEach( async function (tf) {
        localtmp = new SysAccountsStatus(tf)
        test = await localtmp.save().then(function (a) {
            return a
        }).catch(function(error){
            return error 
        })
        if (test.code === 11000) {
            console.log(test.message)
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
        test = await localtmp.save().then(function (a) {
            return a
        }).catch(function(error){
            return error 
        })
        if (test.code === 11000) {
            console.log(test.message)
        }
    })
    return response.resultOutputSuccess('seed SysAppContext, SysAccountsStatus, SysUserTypes')
} 

async function signup (payload) {
    const validation = sysPolicy.signup(payload.REQ_INPUTS)
    if (validation.isok) {
        const {name, email, secret, confirmSecret} = payload.REQ_INPUTS
        console.log(name, email, secret, confirmSecret)    
    } else {
        return response.resultOutputError(validation.error)
    }
    return response.resultOutputSuccess('signup')
}
async function signin (payload) {
    return response.resultOutputError(signin)
}

const _instances = {
    signup: signup,
    signin: signin,
    seedAuxModels: seedAuxModels   
};

module.exports = _instances