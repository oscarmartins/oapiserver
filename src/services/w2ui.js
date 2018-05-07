const auth = require('../controllers/AuthenticationController')

const instance = {
    login: auth.signin
}

module.exports = instance