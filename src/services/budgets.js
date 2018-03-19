const nodemailer = require('nodemailer')
const resultOutput = require('../utils/Utils')['resultOutput']
const {modelBudget} = require('../models')
const emailExpresscleanPt = require('/opt/orccontext')['email_expressclean_pt']
var localContext = null

var inputfields = {
    budgetDomain: '',
    budgetType: 0,
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
    }
    return txtLbl
}

async function notificator (message) {
  let transporter = nodemailer.createTransport({
    host: emailExpresscleanPt.host,
    port: emailExpresscleanPt.port,
    secure: emailExpresscleanPt.secure, // true for 465, false for other ports
    auth: {
      user: emailExpresscleanPt.user, // generated ethereal user
      pass: emailExpresscleanPt.pass // generated ethereal password
    }
  })

  message.from = emailExpresscleanPt.user

  const output = await transporter.sendMail(message).then(function(info){
    var log = `Message sent: ${info.messageId} - `
    log += `Preview URL: ${nodemailer.getTestMessageUrl(info)}`
    return resultOutput.resultOutputSuccess(log)
  }).catch(function(error){
    if (error) {
      let maillogerror = '*** email error logger ***\n'
      maillogerror += error
      maillogerror += '\n'
      maillogerror += 'message= ' + JSON.stringify(message)
      return resultOutput.resultOutputError(maillogerror)
    }
    return resultOutput.resultOutputError('error desconhecido')
  })
  return output
}

async function budgetsRequest (context) {
    localContext = context

    const tryNotify = await notificator({to:'oscarrafaelcampos@gmail.com', subject:'budgets tester', text:'text tester email budgets!!!√'})
    if(tryNotify.iook){
//todo
    } else {
//todo
    }

    // serviceType(localContext.main.REQ_INPUTS.budgetSeviceType)

    return resultOutput.resultOutputDataOk(tryNotify)
}

const local = {
  budgetsRequest: async function (context) {
      const br = await budgetsRequest(context)
      return br
    }
}

module.exports = local
