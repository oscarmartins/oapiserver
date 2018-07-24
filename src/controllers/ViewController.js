const jwtoken = require('../utils/Utils')['jwtToken']
const CustomerController = require('./CustomerController')
let orcApiController = null
let user, costumer

const layout = ['orc_toolbar', 'orc_sidebar']
const layoutRendered = []
/**
 * Token required
 */
const AUTH_ROUTES = ['app/data/dashboard.html']

const viewController = {}
async function checkAuthorization (loadUser) {
    const authorization = jwtoken.tokenRequestVerify(orcApiController.main.httpRequest)
    if(authorization) {
        //console.log('token authorization', authorization)
        if (loadUser) {
            user = await CustomerController.fetchUserByEmail(authorization._id, authorization.email)
            costumer = await CustomerController.fetchCustomer(user)
        }
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
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "logout",  caption: "SignOut", icon: " fas fa-signout", route: "app/data/login.html" })
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

async function renderLayoutSidebar(tagname) {
    viewController[tagname] = {
        name: tagname,
    }
    if (await checkAuthorization(true)) {        
        if (user) {
            viewController[tagname].topHTML = '<div style="background-color: #eee; padding: 10px 5px; border-bottom: 1px solid silver">{useremail}</div>'.replace('{useremail}', user.email),
            viewController[tagname].nodes = [
                { 
                id: 'level-1', 
                text: 'Minha Conta', 
                img: 'icon-folder', 
                expanded: true, group: true,
                nodes: [ 
                    { id: 'level-1-1', text: 'Perfil', icon: 'fa-home' },
                    { id: 'level-1-2', text: 'Dados Contacto', icon: 'fa-coffee' },
                    { id: 'level-1-3', text: 'Dados Acesso', icon: 'fa-comment-alt' }
                ]
            }]
        }
    }
}

async function serverActions () {

    let {fromroute} = orcApiController.main.httpRequest.headers
    let redirectTo = '#/app/data/login.html'

    if (typeof fromroute !== 'undefined') {
        AUTH_ROUTES.forEach(function (v) {
            if ((fromroute.replace('#/', '').replace('#', '')) === v) {
                fromroute = true
                return
            }
            fromroute = false
        })

        if (fromroute) {
            redirectTo = await checkAuthorization(false) ? '' : redirectTo
        } else {
            redirectTo = ''
        }
    } 

    this.options = { 
        redirect: {
            url: redirectTo
        }       
    }
    return this.options
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
        layoutRendered[1] = await renderLayoutSidebar(layout[1])
        const sactions = await serverActions()
        viewController['serverActions'] = sactions
        orcApiController.responseSender({status: 200, output: viewController})

        } catch (error) {
            orcApiController.resolveError({error: error.message})
        }
        return viewController
    }
}

module.exports = instance
