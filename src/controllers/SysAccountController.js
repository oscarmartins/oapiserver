const orcapicontroller = require('./OrcApiController')
const syservices = require('../services/sysServices')
module.exports = {
    async execute (req, res, next) {
        try {
            console.log('Sys Account Management: on execute')
            const main = orcapicontroller.init(req, res, next)
            const ApiPolicy = orcapicontroller.ApiPolicy
            const paramValidator = await orcapicontroller.preparams()
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
                    }
                    if (response) {
                        httpstatus = response.iook ? 200 : 400
                        orcapicontroller.responseSender({status: httpstatus, output: response})
                    } else {
                        httpstatus = 400
                        throw 'REQ_ACTION = ' + main.REQ_ACTION + ' Not Implemented!'
                    }
                } else {
                    httpstatus = 400
                    throw 'REQ_CONTEX Unauthorized service context.'
                }
            } else {
                httpstatus = 500
                throw ((paramValidator.error && paramValidator.error.trim().length > 0) ? paramValidator.error : 'Ocorreu um erro desconhecido. Por favor tente mais tarde. Obrigado.')
            }     
        } catch (error) {
            orcapicontroller.responseSender({status: httpstatus, output: {error: error}})    
        }
    }
}