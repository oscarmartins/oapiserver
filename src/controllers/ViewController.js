const jwtoken = require('../utils/Utils')['jwtToken']
const orcApiController = null
const viewController = {}
async function checkAuthorization () {
    const authorization = jwtoken.tokenRequestVerify(orcApiController.main.httpRequest)
    if(authorization) {
        //console.log('token authorization', authorization)
    } else {
        //console.log('no authorization')
    }
    return authorization
}

const instance = {
    loadView : async (OrcApiController) => {
        orcApiController = OrcApiController

        return viewController
    }
}

module.exports = instance
