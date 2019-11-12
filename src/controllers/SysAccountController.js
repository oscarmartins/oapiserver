const {init, ApiPolicy, preparams, responseSender} = require('./OrcApiController')
const syservices = require('../services/sysServices')
module.exports = {
    async execute (req, res, next) {
        try {
            console.log('Sys Account Management: on execute')
            const main = init(req, res, next)
            const paramValidator = await preparams()
            var httpstatus = 200
            if (paramValidator.isok) {
                if (main.REQ_CONTEX === ApiPolicy.services.sysapp) {
                    var response = null
                    switch (main.REQ_ACTION) {
                        case ApiPolicy.sysapp.signup:
                            response = await syservices.signup(main)
                            break
                        case ApiPolicy.sysapp.signin:
                            response = await syservices.signin(main)
                            break
                        case ApiPolicy.sysapp.seedauxmodels:
                            response = await syservices.seedauxmodels(main)
                            break
                        case ApiPolicy.sysapp.accountverification:
                            response = await syservices.accountverification(main)
                            break
                        case ApiPolicy.sysapp.requestaccountverificationtoken:
                            response = await syservices.requestaccountverificationtoken(main)
                            break
                        case ApiPolicy.sysapp.accountrecovery:
                            response = await syservices.accountrecovery(main)
                            break
                        case ApiPolicy.sysapp.requestaccountrecoverytoken:
                            response = await syservices.requestaccountrecoverytoken(main)
                            break
                    }
                    if (response) {
                        httpstatus = response.iook ? 200 : 400
                        responseSender({status: httpstatus, output: response})
                    } else {
                        httpstatus = 400
                        throw `Request Action not implemented (REQ_ACTION=${main.REQ_ACTION})`
                    }
                } else {
                    httpstatus = 400
                    throw `Request Context not Unauthorized (REQ_CONTEX=${REQ_CONTEX})`
                }
            } else {
                httpstatus = 500
                throw ((paramValidator.error && paramValidator.error.trim().length > 0) ? paramValidator.error : 'An unknown error has occurred. Please try again later.')
            }     
        } catch (error) {
            responseSender({status: httpstatus, output: {error: error}})    
        }
    }
}