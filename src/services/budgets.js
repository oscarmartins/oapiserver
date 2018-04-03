const nodemailer = require('nodemailer')
const resultOutput = require('../utils/Utils')['resultOutput']
const {budgets} = require('../models')
const emailExpresscleanPt = require('/opt/orccontext')['email_expressclean_pt']

const BUDGET_CALLBACK = 10
const BUDGET_FORM = 20
const BUDGET_SUPPORT = 30

var localContext = null

const inputfields = Object.freeze({
    budgetDomain: {
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetType: {
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetName: {
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetEmail: {
      required: [BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetMobile: {
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetStreet: {
      required: [BUDGET_FORM]
    },
    budgetCity: {
      required: [BUDGET_FORM]
    },
    budgetSeviceType: {
      required: [BUDGET_FORM]
    },
    budgetBedRooms: {
      required: [BUDGET_FORM]
    },
    budgetRooms: {
      required: [BUDGET_FORM]
    },
    budgetWc: {
      required: [BUDGET_FORM]
    },
    budgetArea: {
      required: [BUDGET_FORM]
    },
    budgetObserva: {
      required: [BUDGET_FORM, BUDGET_SUPPORT]
    }
})

function labelHelper(label) {
  var text = label
  switch (label) {
    case 'budgetDomain':
      text = 'Dominio'
      break
    case 'budgetType':
      text = 'Tipo '
      break
    case 'budgetName':
      text = 'Nome'
      break
    case 'budgetEmail':
      text = 'Email'
      break
    case 'budgetMobile':
      text = 'Contacto'
      break
    case 'budgetStreet':
      text = 'Morada'
      break
    case 'budgetCity':
      text = 'Cidade'
      break
    case 'budgetSeviceType':
      text = 'Tipo de Limpeza'
      break
    case 'budgetBedRooms':
      text = 'Número Quartos'
      break
    case 'budgetRooms':
      text = 'Número Salas'
      break
    case 'budgetWc':
      text = 'Número Casa Banho'
      break
    case 'budgetArea':
      text = 'Area Aprox.'
      break
    case 'budgetObserva':
      text = 'Observações'
      break
  }
  return text
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
    let txtLbl = tp
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

async function createTransport() {
  return nodemailer.createTransport({
    host: emailExpresscleanPt.host,
    port: emailExpresscleanPt.port,
    secure: emailExpresscleanPt.secure, // true for 465, false for other ports
    auth: {
      user: emailExpresscleanPt.user, // generated ethereal user
      pass: emailExpresscleanPt.pass // generated ethereal password
    }
  })
}

async function Notificator (message) {  
  let transporter = await createTransport().then(function(tporter){
    if (tporter) {
      message.from = emailExpresscleanPt.user
      return tporter.sendMail(message).then(function (info) {
        var log = `Message sent: ${info.messageId} - `
        log += `Preview URL: ${nodemailer.getTestMessageUrl(info)}`
        return resultOutput.resultOutputSuccess(log)
      }).catch(function (error) {
        if (error) {
          let maillogerror = '*** email error logger ***\n'
          maillogerror += error
          maillogerror += '\n'
          maillogerror += 'message= ' + JSON.stringify(message)
          return resultOutput.resultOutputError(maillogerror)
        }
        return resultOutput.resultOutputError('error sendEmail ??? desconhecido')
      })
    } else {
      return resultOutput.resultOutputError('argumento errado')
    }   
  }).catch(function (err) {
    console.log(err)
    return null
  })

  if (transporter) {
    return transporter
  } else {
    return resultOutput.resultOutputError('Erro ao enviar email')
  }
  
}

function requiredParameters (a, b) {
  return inputfields[a].required.indexOf(b) != -1
}

async function checkParameters (payload) {
  const budgetType = payload['budgetType'] || false
  var iook = true, success = 'input fields valid', error = null
  for (var key in inputfields) {
    if (!budgetType || !payload.hasOwnProperty(key)) {
      error = 'Error parameter {{key}} not exist!'.replace('{{key}}', key)
      break
    } else {
      if (!requiredParameters(key, budgetType)) {
        continue
      }
      var _value = payload[key]
      if (typeof _value === "undefined" || _value.length <= 0){
        error = 'Error parameter {{key}} value not valid!'.replace('{{key}}', key)
        break
      }
    }   
  }
  
  if (error) {
    return resultOutput.resultOutputError(error)
  }  
  return resultOutput.resultOutputSuccess(success)
}

async function budgetsRequest (context) {
    localContext = context

    const params = await checkParameters(localContext.main.REQ_INPUTS)    

    if (params && params.iook) {

      const budgetDoc = new budgets(localContext.main.REQ_INPUTS)
      budgetDoc.dateCreated = Date.now()
      budgetDoc.dateUpdated = Date.now()      
      const saveBudget = await budgetDoc.save(true).then(async function (docs) {
        var subject = '', bodymail = '', emaildata = {}, tryNotify = null
        if (docs.budgetType && docs.budgetType === BUDGET_FORM) {
          subject = 'Pedido de Orçamento - [[name]], [[street]]'.replace('[[name]]', docs.budgetName).replace('[[street]]', docs.budgetCity)
          bodymail = '<h2>{{subtitle}}</h2>'.replace('{{subtitle}}', subject)
          bodymail += '<ul>'
          for (var key in inputfields) {
            if (docs.hasOwnProperty(key) || docs[key]) {
              if (key === 'budgetDomain' || key === 'budgetType')
                continue
              bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper(key)).replace('[[value]]', serviceType(docs[key]))
            }
          }
          bodymail += '</ul>'

          emaildata = {
            to: 'geral@expressclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', docs.budgetEmail))
          } else {
            console.log(tryNotify.error)
          }

          return resultOutput.resultOutputDataOk(tryNotify)
        } else if (docs.budgetType && docs.budgetType === BUDGET_CALLBACK) {
          subject = 'Pedido de Contacto - [[name]]'.replace('[[name]]', docs.budgetName)
          bodymail = '<h2>{{subtitle}}</h2>'.replace('{{subtitle}}', subject)

          bodymail += '<ul>'
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetName')).replace('[[value]]', serviceType(docs[key]))
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetMobile')).replace('[[value]]', serviceType(docs[key]))
          bodymail += '</ul>'

          emaildata = {
            to: 'geral@expressclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', docs.budgetEmail))
          } else {
            console.log(tryNotify.error)
          }
        } else if (docs.budgetType && docs.budgetType === BUDGET_SUPPORT) {
          emaildata = {
            to: 'geral@expressclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', docs.budgetEmail))
          } else {
            console.log(tryNotify.error)
          }
        }
        return resultOutput.resultOutputError('Error budgetType unknown error')
      }).catch(function (err, doc) {
        if (err) {
          return err.message
        }
        return 'error desconhecido'
      })

      return resultOutput.resultOutputDataOk(saveBudget)
    } else {
      console.log(params.error)
    }    

    // serviceType(localContext.main.REQ_INPUTS.budgetSeviceType)

    return resultOutput.resultOutputDataOk(params)
}

const local = {
  budgetType: {
    BUDGET_CALLBACK: BUDGET_CALLBACK,
    BUDGET_FORM: BUDGET_FORM,
    BUDGET_SUPPORT: BUDGET_SUPPORT
  },
  budgetsRequest: async function (context) {
      const br = await budgetsRequest(context)
      return br
    }
}

module.exports = local
