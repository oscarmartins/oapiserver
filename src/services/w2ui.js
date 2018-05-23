const auth = require('../controllers/AuthenticationController')
const AccountPolicy = require('../policies/AccountPolicy')

const instance = {
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
    passwordRecovery: auth.passwordRecovery,
    logout: auth.signout
}

module.exports = instance