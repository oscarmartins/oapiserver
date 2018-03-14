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
  console.log(emailExpresscleanPt)
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

  transporter.sendMail(message, (error, info) => {
    if (error) {
      let maillogerror = '*** email error logger ***\n'
      maillogerror += error
      maillogerror += '\n'
      maillogerror += 'message= ' + JSON.stringify(message)
      return console.log(maillogerror)
    }
    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  })
}

async function budgetsRequest (context) {
    localContext = context

    await notificator({to:'oscarrafaelcampos@gmail.com', subject:'budgets tester', text:'text tester email budgets!!!√'})

    return resultOutput.resultOutputDataOk(serviceType(localContext.main.REQ_INPUTS.budgetSeviceType))
}

const local = {
  budgetsRequest: async function (context) {
      const br = await budgetsRequest(context)
      return br
    }
}

module.exports = local
