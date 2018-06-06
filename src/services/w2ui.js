const accountController = require('../controllers/AccountController')
const auth = require('../controllers/AuthenticationController')
const AccountPolicy = require('../policies/AccountPolicy')

const instance = {
    options:auth.options,
    login: auth.signin,
    register: async function (w2records) {
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
    },
    passwordRecovery: async function (req, res, next) {
        //auth.passwordRecovery
        const result = await accountController.execute(req, res)
        return result
    },
    logout: auth.signout
}

module.exports = instance