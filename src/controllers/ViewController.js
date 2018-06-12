const jwtoken = require('../utils/Utils')['jwtToken']
let orcApiController = null

const layout = ['orc_toolbar', 'orc_sidebar']
const layoutRendered = []

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

async function renderLayoutToolbar (tagname) {
    viewController[tagname] = {
        name: tagname,
        items: []
    }
    if (await checkAuthorization()) {
        viewController[tagname].items.push({ type: "button",  id: "start",  caption: "Inicio", icon: " fas fa-home", route: "app/data/dashboard.html" })
    } else {
        viewController[tagname].items.push({ type: "button",  id: "start",  caption: "Inicio", icon: " fas fa-home", route: "app/data/start.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "login",  caption: "Login", icon: " fas fa-sign-in-alt", route: "app/data/login.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "register",  caption: "Registo", icon: " fas fa-user-plus", route: "app/data/registo.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "recovery",  caption: "Recuperar Conta", icon: " fas fa-key", route: "app/data/recoveryPassword.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "info",  caption: "", icon: " fas fa-exclamation-circle", route: "app/data/infoApp.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "test01",  caption: "test dashboard", icon: " fas fa-exclamation-circle", route: "app/data/dashboard.html" })
    }
    
    
}

const instance = {
    loadView : async (OrcApiController) => {
       try {
        orcApiController = OrcApiController

        viewController['server'] = {
            context: 'w2ui',
            local_server_path: 'http://localhost:8081/orcv2',
            remote_server_path : 'https://orcseven.com/api/orcv2',
            serverUrlApi: 'https://orcseven.com/api/orcv2'
        }

        viewController['ApiPolicy'] = orcApiController.ApiPolicy

        layoutRendered[0] = await renderLayoutToolbar(layout[0])

        orcApiController.responseSender({status: 200, output: viewController})

        } catch (error) {
            orcApiController.resolveError({error: error.message})
        }
        return viewController
    }
}

module.exports = instance
