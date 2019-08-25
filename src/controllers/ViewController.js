const jwtoken = require('../utils/Utils')['jwtToken']
const CustomerController = require('./CustomerController')
let orcApiController, user, costumer

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
        if (loadUser) {
            user = await CustomerController.fetchUserByEmail(authorization._id, authorization.email)
            costumer = await CustomerController.fetchCustomer(user)
        }
    } // else {
        //console.log('no authorization')
    // }
    return authorization
}

async function renderLayoutToolbar (tagname) {
    viewController[tagname] = {
        name: tagname,
        items: []
    }
    if (await checkAuthorization()) {
        viewController[tagname].items.push({ type: "button",  id: "start",  caption: "Inicio", icon: " fas fa-home", route: "app/data/dashboard.html"})
        /**experimental */
        viewController[tagname].items.push({ type: "html", html: '<div class="w2ui-toolbar-search"><table cellpadding="0" cellspacing="0"><tbody><tr>    <td><div class="w2ui-icon icon-search-down w2ui-search-down"></div></td>    <td>        <input type="text" id="grid_grid_search_all" class="w2ui-search-all" tabindex="-1" placeholder="All Fields" value="" >    </td>    <td>        <div class="w2ui-search-clear" id="grid_grid_searchClear" style="display: none">&nbsp;&nbsp;</div>    </td></tr></tbody></table></div>',  id: "global-search",  caption: "", icon: "", route: "app/data/dashboard.html"})

        viewController[tagname].items.push({ type: "spacer"})        
        viewController[tagname].items.push({ type: "radio",  id: "refresh",  caption: "", icon: " fas fa-sync-alt", action: "refreshAll" })
        viewController[tagname].items.push({ type: "button",  id: "logout",  caption: "", icon: " fas fa-sign-out-alt", route: "app/data/logout.html" })       
    } else {
        viewController[tagname].items.push({ type: "button",  id: "start",  caption: "Inicio", icon: " fas fa-home", route: "app/data/start.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "login",  caption: "Login", icon: " fas fa-sign-in-alt", route: "app/data/login.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "register",  caption: "Registo", icon: " fas fa-user-plus", route: "app/data/registo.html" })
        viewController[tagname].items.push({ type: "spacer"})
        viewController[tagname].items.push({ type: "button",  id: "recovery",  caption: "Recuperar Conta", icon: " fas fa-key", route: "app/data/recoveryPassword.html" })
        viewController[tagname].items.push({ type: "spacer"})
        //viewController[tagname].items.push({ type: "button",  id: "info",  caption: "", icon: " fas fa-exclamation-circle", route: "app/data/infoApp.html" })
        //viewController[tagname].items.push({ type: "spacer"})
        //viewController[tagname].items.push({ type: "button",  id: "test01",  caption: "test dashboard", icon: " fas fa-exclamation-circle", route: "app/data/dashboard.html" })
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
                expanded: false, group: true,
                nodes: [ 
                    { id: 'costumerProfile', text: 'Perfil ', icon: 'fa-home' }
                    // { id: 'costumerContact', text: 'Dados Contacto ', icon: 'fa-coffee' },
                    // { id: 'costumerPasswordChange', text: 'Dados Acesso', icon: 'fa-comment-alt' }
                ]
            },
            { 
                id: 'level-2', 
                text: 'Sites', 
                img: 'icon-web', 
                expanded: false, group: true,
                nodes: [ 
                    { id: 'siteConfig', text: 'Sites Detalhes ', icon: 'fa-home' },
                    { id: 'blogcar', text: 'Gestor Blog ', icon: 'fa-web' }                        
                ]
            }
        ]
        }
    }
}

async function serverActions () {

    let {fromroute} = orcApiController.main.httpRequest.headers
    let redirectTo = '#/app/data/login.html'
    let checkToken = false;
    if (typeof fromroute !== 'undefined') {
       
        AUTH_ROUTES.forEach(function (v) {
            if ((fromroute.replace('#/', '').replace('#', '')) === v) {
                checkToken = true
                return
            }
            checkToken = false
        })

        if (checkToken) {
            redirectTo = await checkAuthorization(false) ? '' : redirectTo
        } else {
            redirectTo = (fromroute.replace('#/', '').replace('#', '')) === 'app/data/logout.html' ? redirectTo  : ''            
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
            remote_server_path : 'https://oscarmartins.pt/api/orcv2',
            serverUrlApi: 'https://oscarmartins.pt/api/orcv2'
        }

        viewController['ApiPolicy'] = orcApiController.ApiPolicy

        layoutRendered[0] = await renderLayoutToolbar(layout[0])
        layoutRendered[1] = await renderLayoutSidebar(layout[1])
        const srActions = await serverActions()
        viewController['serverActions'] = srActions
        orcApiController.responseSender({status: 200, output: viewController})

        } catch (error) {
            orcApiController.resolveError({error: error.message})
        }
        return viewController
    }
}

module.exports = instance
