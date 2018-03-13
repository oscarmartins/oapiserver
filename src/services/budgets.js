const resultOutput = require('../utils/Utils')['resultOutput']

var localContext = null

var inputfields = {
    budgetName: '',
    budgetEmail: '',
    budgetMobile: '',
    budgetStreet: '',
    budgetCity: '',
    budgetSeviceType: '',
    budgetBedRooms: '',
    budgetRooms: '',
    budgetWc: '',
    budgetArea: '',
    budgetObserva: ''
}

/**
 * 
 * @param {*} tp 
 * <option value="LD">Limpeza doméstica</option>
    <option value="LC">Limpeza de condomínios</option>
    <option value="LCL">Limpeza comercial</option>
    <option value="LPO">Limpeza pós-obras</option>
    <option value="LPM">Limpeza pré-mudanças</option>
    <option value="LVF">Limpeza vidros/fachadas</option>
 */
function serviceType(tp) {
    let txtLbl = '(not found)'
    switch (tp) {
        case 'LD':
          txtLbl = 'Limpeza doméstica'            
          break;
        case 'LC':
          txtLbl = 'Limpeza de condomínios'            
          break;
        case 'LCL':
          txtLbl = 'Limpeza comercial'            
          break;
        case 'LPO':
          txtLbl = 'Limpeza pós-obras'
          break; 
        case 'LPM':
          txtLbl = 'Limpeza pré-mudanças'
          break;        
        case 'LVF':
          txtLbl = 'Limpeza vidros/fachadas'
          break;  
        default:
            break;
    }
    return txtLbl
}

async function budgetsRequest (context) {
    localContext = context
    return resultOutput.resultOutputDataOk(serviceType(context.main.REQ_INPUTS.budgetSeviceType))
}

const local = {
  budgetsRequest: async function (context) {
      const br = await budgetsRequest(context)
      return br
    }
}

module.exports = local
