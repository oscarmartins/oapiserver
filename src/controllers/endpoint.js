const orcapicontroller = require('./OrcApiController')
const apiPolicy = require('../policies/ApiPolicy')
const _budgets = require('../services/budgets')
const crmservice = require('../services/CRMSERVICE')

async function CRMSYS () {
  var result = null, data2;
  switch (orcapicontroller.main.REQ_ACTION) {
    case apiPolicy.crmsys.sidebar:       
      var data = {
        "items": [
            {"id": "recent", "text": "grupos de utiizadores", "icon": "recent.png", "selected": true, data: {"route": "/users/groups.html"}},
            {"id": "desktop", "text": "Desktop", "icon": "desktop.png"},
            {"id": "downloads", "text": "Downloads", "icon": "downloads.png"},
            {"type": "separator"},
            {"id": "documents", "text": "Documents", "icon": "documents.png"},
            {"id": "music", "text": "Music", "icon": "music.png"},
            {"id": "pictures", "text": "Pictures", "icon": "pictures.png"},
            {"id": "video", "text": "Video", "icon": "video.png"},
            {"type": "separator"},
            {"id": "disk_c", "text": "Windows (C:)", "icon": "disk_c.png"},
            {"id": "disk_d", "text": "Data (D:)", "icon": "disk_d.png"},
            {"id": "disk_e", "text": "DVD RW (E:)", "icon": "disk_e.png"}
        ]};
        result = await orcapicontroller.responseSender({status: 200, output: data});
    break;   
    case apiPolicy.crmsys.addUserGroup:
        data2 = await crmservice.addUserGroup(orcapicontroller.main.REQ_INPUTS.data);
        result = await orcapicontroller.responseSender({status: 200, output: data2});
    break; 
    case apiPolicy.crmsys.allUserGroup:
        data2 = await crmservice.allUserGroup();
        result = await orcapicontroller.responseSender({status: 200, output: data2});
    break; 
  default:
    result = await orcapicontroller.resolveError({error: 'Error [CRM System service not found] CRMSYS()' });
    break;
  }
  return result;
}

async function budgets () {
    var result = null
    switch (orcapicontroller.main.REQ_ACTION) {
      case apiPolicy.services.budgetsRequest:       
        result = await _budgets.budgetsRequest(orcapicontroller)        
        orcapicontroller.responseSender({status: 200, output: result.data})
      break;    
    default:
      orcapicontroller.resolveError({error: 'Error [Budgets service not found] budgets()' })
      break;
    }
    return result
}

async function w2uiService () {
  const serverContext = orcapicontroller.main.httpRequest.headers.severcontext;
  var outresp = {};
  if(serverContext === 'w2ui') {
    const w2uiService = require('../services/w2ui');
    outresp = await w2uiService.executeService(orcapicontroller);
    /****/  
    orcapicontroller.responseSender({status: 200, output: outresp});
    /****/    
  } else {
    orcapicontroller.resolveError({error: 'Error [w2ui serverContext not found] ' });
  }   
  return outresp;
}

async function execute (req, res, next) {
    console.log('Intro EndPoint app -> execute <-');
    if (next) {
      console.log('next exist');
    }

    var hasErrors = false; // local control
    
    orcapicontroller.init(req, res, next);

    if (req.originalUrl.includes('viewController')){
      const viewController = require('./ViewController')
      const vres = await viewController.loadView(orcapicontroller)
      return next();
    }

    if(Object.keys(req.body).length === 0){
      /**
      console.log(req)
      orcapicontroller.responseSender({status: 200, output: {'status': 'success'}})
      return true;
      **/
     console.log('*** http request datatype error -> body empty ***');
    }

    const paramValidator = await orcapicontroller.preparams()
    
    if (paramValidator.isok) {
        switch (orcapicontroller.main.REQ_CONTEX) {
            case apiPolicy.services.crmsys:
              const crmresolve = await CRMSYS()
              break;
            case apiPolicy.services.root:
              const respBudget = await budgets()
              break;
            case apiPolicy.services.w2ui:
            case apiPolicy.services.paluticars:
              const respw2ui = await w2uiService()     
              break;
            default:
              paramValidator.error = '** [The Request Context ({]REQCTX[}) not found] **'.replace('{]REQCTX[}',orcapicontroller.main.REQ_CONTEX)
              hasErrors = true
              break;
        }
    } else {
      hasErrors = true
    }
    if (hasErrors) {
      orcapicontroller.resolveError(paramValidator)
    }
    return true
} 

const endpoint = {
  execute: async (req, res, next) => {execute(req, res, next)}
}

module.exports = endpoint
