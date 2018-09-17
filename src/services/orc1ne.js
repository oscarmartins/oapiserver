const auth = require('../controllers/AuthenticationController')
const AccountPolicy = require('../policies/AccountPolicy')
const EmailManager = require('../controllers/EmailManager')
const jwtoken = require('../utils/Utils')['jwtToken']
const orcapicontroller = {}

const apiPolicy = auth.options

async function executeService (oap) {
    const outresp = {};
    outresp.status = 200;

    return outresp;
}


const instance = {
    options:apiPolicy,
    executeService: executeService   
}

module.exports = instance