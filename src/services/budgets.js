/**
 * db.budgets.find({
 * dateCreated: { "$gte" : ISODate("2018-05-14T00:00:00Z"), "$lt" : ISODate("2018-05-14T19:00:00Z") }, 
 * budgetType: 20 }).pretty()
 * 
 * **/


const nodemailer = require('nodemailer')
const BulkSMS = require('../utils/BulkSMS')
const resultOutput = require('../utils/Utils')['resultOutput']
const getClientIp = require('../utils/Utils')['ipMiddleware']['getClientIp']
const {budgets} = require('../models')
const emailsafecleanpt = require('/opt/orccontext')['email_safeclean_pt']

const BUDGET_CALLBACK = 10
const BUDGET_FORM = 20
const BUDGET_SUPPORT = 30

var localContext = null

const LIMPDOMESTICA ='LD'
const LIMPCONDOMINIOS = 'LC'
const LIMPESCRITORIOS = 'LE'
const LIMPARMAZENS = 'LA'
const LIMPPOSOBRA = 'LPO'
const LIMPMUDANCAS = 'LPM'
const LIMPVIDROS = 'LVF'

const INPUT_FIELDS = [
  'budgetName', //0
  'budgetEmail', //1 
  'budgetMobile', //2  
  'budgetStreet', //3
  'budgetCity', //4
  'budgetTipologia', //5 
  'budgetFloor', //6
  'budgetBedRooms', //7
  'budgetRooms', //8
  'budgetWc', //9
  'budgetArea', //10
  'budgetFocos', //11
  'budgetObserva', //12,
  'budgetWindows', //13,
  'budgetPortNumber' //14
  ]

const inputfields = Object.freeze({
    budgetDomain: {
      name: 'budgetDomain',
      label: 'Dominio ',
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetType: {
      name: 'budgetType',
      label: 'Tipo ',
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetName: {
      name: 'budgetName',
      label: 'Nome ',
      required: [BUDGET_CALLBACK, BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetEmail: {
      name: 'budgetEmail',
      label: 'Email ',
      required: [BUDGET_FORM, BUDGET_SUPPORT]
    },
    budgetMobile: {
      name: 'budgetMobile',
      label: 'Contacto ',
      required: [BUDGET_CALLBACK, BUDGET_FORM]
    },
    budgetStreet: {
      name: 'budgetStreet',
      label: 'Morada ',
      required: [BUDGET_FORM]
    },
    budgetPortNumber: {
      name: 'budgetAndar',
      label: 'Andar',
      required: [BUDGET_FORM]
    },
    budgetPortNumber: {
      name: 'budgetPortNumber',
      label: 'Nº Porta',
      required: [BUDGET_FORM]
    },
    budgetCity: {
      name: 'budgetCity',
      label: 'Cidade ',
      required: [BUDGET_FORM]
    },
    budgetSeviceType: {
      name: 'budgetSeviceType',
      label: 'Tipo de Limpeza',
      required: [BUDGET_FORM]
    },
    budgetBedRooms: {
      name: 'budgetBedRooms',
      label: 'Nº  Quartos ',
      required: [BUDGET_FORM]
    },
    budgetRooms: {
      name: 'budgetRooms',
      label: 'Nº  Salas',
      required: [BUDGET_FORM]
    },
    budgetWc: {
      name: 'budgetWc',
      label: 'Nº  Casa Banho ',
      required: [BUDGET_FORM]
    },
    budgetTipologiaSelect: {
      name: 'budgetTipologiaSelect',
      label: 'Tipologia',
      required: [BUDGET_FORM]
    },
    budgetTipologia: {
      name: 'budgetTipologia',
      label: 'Outra Tipologia ',
      required: [BUDGET_FORM]
    },
    budgetFloor: {
      name: 'budgetFloor',
      label: 'Nº  Pisos ',
      required: [BUDGET_FORM]
    },
    budgetFocos: {
      name: 'budgetFocos',
      label: 'Nº  Focos ',
      required: [BUDGET_FORM]
    },    
    budgetWindows: {
      name: 'budgetWindows',
      label: 'Nº  Janelas ',
      required: [BUDGET_FORM]
    },        
    budgetArea: {
      name: 'budgetArea',
      label: 'Area Aprox. ',
      required: []
    },
    budgetObserva: {
      name: 'budgetObserva',
      label: 'Observações ',
      required: [BUDGET_FORM, BUDGET_SUPPORT]
    }
})

function labelHelper(label) {
  const tmp = inputfields[label]
  if (tmp) {
    return tmp.label
  }
  return label
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
        case LIMPDOMESTICA:
          txtLbl = 'Limpeza doméstica'            
          break;
        case LIMPCONDOMINIOS:
          txtLbl = 'Limpeza de condomínios'            
          break;
        case LIMPESCRITORIOS:
          txtLbl = 'Limpeza escritórios'            
          break;
        case LIMPPOSOBRA:
          txtLbl = 'Limpeza pós-obras'
          break; 
        case LIMPARMAZENS:
          txtLbl = 'Limpeza armazens'
          break; 
        case LIMPMUDANCAS:
          txtLbl = 'Limpeza pré-mudanças'
          break;        
        case LIMPVIDROS:
          txtLbl = 'Limpeza vidros/fachadas'
          break;  
    }
    return txtLbl
}

async function createTransport() {
  return nodemailer.createTransport({
    host: emailsafecleanpt.host,
    port: emailsafecleanpt.port,
    secure: emailsafecleanpt.secure, // true for 465, false for other ports
    auth: {
      user: emailsafecleanpt.user, // generated ethereal user
      pass: emailsafecleanpt.pass // generated ethereal password
    }
  })
}

async function Notificator (message) {  

  if(message.hasOwnProperty('html')){
    var bodymail = '<p>---</p>'
    bodymail += '<p>Cumprimentos,</p>'
    bodymail += '<p><span style="font-family: \'andale mono\', monospace; font-size: 8pt;">(Dep. Comercial)</span></p>'
    bodymail += '<p><span style="font-size: 10pt; font-family: verdana, geneva, sans-serif;">'
    bodymail += '<img id="c26ef759-1d6c-4869-b4be-b2c2afa368a6" class="upload-image-379 aspect-ratio" style="max-width: 100%;" src="https://safeclean.pt/img/logo.png" alt="" /></span></p>'
    bodymail += '<p><span style="color: #284d71;"><u>914423370 </u></span>-  <a href="https://www.safeclean.pt">www.safeclean.pt </a>                                        </p>'
    bodymail += '<p> </p>'
    message.html += bodymail
  }

  let transporter = await createTransport().then(function(tporter){
    if (tporter) {
      message.from = emailsafecleanpt.user
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
    return err
  })

  if (transporter) {
    return transporter
  } else {
    return resultOutput.resultOutputError('Erro ao enviar email')
  }
  
}

function requiredParameters (a, b) {
  return inputfields[a].required.indexOf(Number(b)) >= 0
}

function validateBudgetFieldForm(key, payload) {
  var validateField = false
  const showFieldsGroup = []
  const budgetSeviceType = payload['budgetSeviceType']

  if (budgetSeviceType) {

    showFieldsGroup.push(INPUT_FIELDS[0])
    showFieldsGroup.push(INPUT_FIELDS[1])
    showFieldsGroup.push(INPUT_FIELDS[2])
    showFieldsGroup.push(INPUT_FIELDS[3])
    showFieldsGroup.push(INPUT_FIELDS[4])
    showFieldsGroup.push(INPUT_FIELDS[14])

    if (payload['budgetTipologiaSelect'] === 'TT') {
      showFieldsGroup.push(INPUT_FIELDS[5])
    }

    switch (budgetSeviceType) {
      case LIMPDOMESTICA:
      case LIMPMUDANCAS:
      case LIMPPOSOBRA:
      default:
        showFieldsGroup.push(INPUT_FIELDS[7])
        showFieldsGroup.push(INPUT_FIELDS[8])
        showFieldsGroup.push(INPUT_FIELDS[9])
        showFieldsGroup.push(INPUT_FIELDS[6])
        break;
      case LIMPCONDOMINIOS:
        showFieldsGroup.push(INPUT_FIELDS[6])
        showFieldsGroup.push(INPUT_FIELDS[10])
        showFieldsGroup.push(INPUT_FIELDS[11])
        break;
      case LIMPESCRITORIOS:
      case LIMPARMAZENS:
        showFieldsGroup.push(INPUT_FIELDS[6])
        showFieldsGroup.push(INPUT_FIELDS[10])
        break;
      case LIMPVIDROS:
        showFieldsGroup.push(INPUT_FIELDS[10])
        showFieldsGroup.push(INPUT_FIELDS[13])
        break;
    }  

    showFieldsGroup.forEach(function (name, position, allarr) {
      if (name === key) {
        validateField = true
        return
      }
    })
  }

  return validateField
}

async function checkParameters(payload) {
  const budgetType = payload['budgetType'] || false
  var iook = true, success = 'input fields valid', error = null
  if (budgetType && budgetType === BUDGET_FORM && !payload['budgetSeviceType']) {
    error = 'Error parameter {{key}} required!'.replace('{{key}}', budgetType ? 'budgetSeviceType' : 'budgetType')
  } else {
    for (var key in inputfields) {

      const testParam = (Number(budgetType) !== BUDGET_CALLBACK && 
                        Number(budgetType) !== BUDGET_SUPPORT && 
                        !payload.hasOwnProperty(key))

      if (!budgetType || testParam) {
        error = 'Error parameter {{key}} not exist!'.replace('{{key}}', key)
        break
      } else {
        if (!requiredParameters(key, budgetType)) {
          continue
        }

        var _value = payload[key]

        /**filtro */
        if (key === 'budgetEmail' && _value && _value === 'oscar@mail.pt') {
          /**
          budgets.find({}, function (e, a) {
            console.log('Mongo 1 ', e, a)
          })
           */
          error = 'Email de testes nao se envia email!!'

          var smsbody = 'SAFECLEAN O cliente [[name]] pretende ser contactado. [[mobile]].'.replace('[[name]]', 'Oscar Martins').replace('[[mobile]]', '913859014') 
          console.log(smsbody)
          //const smstest = await local.SMSNotificator({mobileTo: '+351913859014', msgTo: smsbody})
          //console.log('logger sms: ', smstest)
          break
        }

        if (budgetType && Number(budgetType) === BUDGET_FORM && !validateBudgetFieldForm(key, payload)) {
          continue
        }

        if (typeof _value === "undefined" || _value.length <= 0) {
          error = 'Deve indicar um valor para {{key}}.'.replace('{{key}}', labelHelper(key))
          break
        }
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
      budgetDoc.budgetClientIp = localContext.main.httpRequest.connection.remoteAddress
      budgetDoc.budgetDomain = localContext.main.httpRequest.headers.host
      budgetDoc.dateCreated = Date.now()
      budgetDoc.dateUpdated = Date.now()      
      const saveBudget = await budgetDoc.save(true).then(async function (docs) {
        var subject = '', bodymail = '', emaildata = {}, tryNotify = null
        
        if (docs.budgetType && docs.budgetType === BUDGET_FORM) {
          subject = 'Pedido de Orçamento - [[name]], [[street]]'.replace('[[name]]', docs.budgetName).replace('[[street]]', docs.budgetCity)
          bodymail = '<h2>{{subtitle}}</h2>'.replace('{{subtitle}}', subject)
          bodymail += '<p>id: {{orcid}}</p>'.replace('{{orcid}}',  docs._id)
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
            to: 'geral@safeclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', docs.budgetEmail))
          } else {
            console.log(tryNotify.error)
          }

          return resultOutput.resultOutputSuccess('O seu orçamento foi submetido com sucesso. Obrigado pela sua preferência.')

        } else if (docs.budgetType && docs.budgetType === BUDGET_CALLBACK) {
          subject = 'Pedido de Contacto - [[name]]'.replace('[[name]]', docs.budgetName)
          bodymail = '<h2>{{subtitle}}</h2>'.replace('{{subtitle}}', subject)
          bodymail += '<p>O cliente pediu para ser contatado nas proximas horas.</p>'
          bodymail += '<ul>'
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetName')).replace('[[value]]', serviceType(docs['budgetName']))
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetMobile')).replace('[[value]]', serviceType(docs['budgetMobile']))
          bodymail += '</ul>'

          emaildata = {
            to: 'geral@safeclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', emaildata.to))       
            var smsbody = 'SAFECLEAN O cliente [[name]] pretende ser contactado. [[mobile]].'.replace('[[name]]',  docs['budgetName']).replace('[[mobile]]', docs['budgetMobile']) 
            const smstest = await local.SMSNotificator({mobileTo: '+351916665011', msgTo: smsbody})
          } else {
            console.log(tryNotify.error)
          }
          return resultOutput.resultOutputSuccess('O seu Pedido de Contacto foi submetido e registado com sucesso. Entraremos em contacto consigo o mais brevemente possível. Obrigado pela sua preferência.')
        } else if (docs.budgetType && docs.budgetType === BUDGET_SUPPORT) {

          subject = 'Pedido de Suporte - [[name]]'.replace('[[name]]', docs.budgetName)
          bodymail = '<h2>{{subtitle}}</h2>'.replace('{{subtitle}}', subject)
          bodymail += '<p>Pedido Suporte </p>'
          bodymail += '<ul>'
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetName')).replace('[[value]]', serviceType(docs['budgetName']))
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetEmail')).replace('[[value]]', serviceType(docs['budgetEmail']))
          bodymail += '<li><strong>[[label]]</strong>: [[value]] </li>'.replace('[[label]]', labelHelper('budgetObserva')).replace('[[value]]', serviceType(docs['budgetObserva']))
          bodymail += '</ul>'

          emaildata = {
            to: 'geral@safeclean.pt',
            subject: subject,
            html: bodymail
          }

          tryNotify = await Notificator(emaildata)
          if (tryNotify && tryNotify.iook) {
            console.log('email sent to {{email}} :)'.replace('{{email}}', docs.budgetEmail))
          } else {
            console.log(tryNotify.error)
          }
          return resultOutput.resultOutputSuccess('O seu Pedido de Suporte foi submetido e registado com sucesso. Entraremos em contacto consigo o mais brevemente possível. Obrigado pela sua preferência.')
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
    console.log(getClientIp(context.main.httpRequest, context.main.httpResponse, context.main.next))
    const br = await budgetsRequest(context)
    return br
  },
  /** 
   * object param {
   * username: '',
   * password: '',
   * mobileTo: '+3519xxxxxxxx',
   * msgTo: ''
   * }
  */
  SMSNotificator: async function (param) {
    let smsResponse = null
    try {
      const sms = new BulkSMS(param.username, param.password)
      if (!param.username || !param.password) {
        sms.useProviderAuth()
      }
      smsResponse = await sms.sendTextMessage(param.mobileTo, param.msgTo)
    } catch (error) {
      console.log('SMSNotificator Error --> ', error)
    }
    return smsResponse
  }
}

module.exports = local
