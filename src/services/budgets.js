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
    bodymail += '<p><span style="font-size: 10pt; font-family: verdana, geneva, sans-serif;"> <img id="c26ef759-1d6c-4869-b4be-b2c2afa368a6" class="upload-image-379 aspect-ratio" style="max-width: 100%; width: 200px;" src="https://safeclean.pt/img/logo.png" alt="" /></span></p>'
    bodymail += '<p><span style="color: #3366ff;"><em><span style="font-size: 8pt;"><span style="font-size: 10pt;"> <a style="color: #3366ff;">215860560</a></span>  |</span><span style="font-size: 10pt;"> <a style="color: #3366ff;">916665011</a> </span></em></span> <br /><span style="color: #99cc00;"><em> <a style="color: #99cc00;" href="https://www.safeclean.pt">www.safeclean.pt </a> | <a style="color: #99cc00;" href="https://www.facebook.com/safeclean.pt/">Safeclean no facebook</a> </em></span> <br /><br /><span style="font-size: 8pt;"> <strong>Sede</strong></span> <br /><span style="font-size: 8pt;">Largo da Lagoa, 15 J sala A </span> <br /><span style="font-size: 8pt;">2795-116</span> <br /><span style="font-size: 8pt;">Linda-a-Velha</span> <br /><br /><span style="font-size: 8pt;"> <strong>Filial</strong></span> <br /><span style="font-size: 8pt;">Centro de Escritórios Jomavipe Business Center</span> <br /><span style="font-size: 8pt;">Rua Cesaltina Fialho Gouveia, 703</span> <br /><span style="font-size: 8pt;">2645-038</span> <br /><span style="font-size: 8pt;">Cascais</span></p>'
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
  const budgetRgpd = payload['budgetRgpd'] || false
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
        if ((key === 'budgetEmail' || key === 'budgetName') && _value && _value === 'oscar@mail.pt') {
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
  } else if (!budgetRgpd) {
    error = 'Para concluir, deve aceitar a Política de Privacidade e Tratamento de Dados Pessoais SAFECLEAN.'
    return resultOutput.resultOutputError(error)
  } else if(budgetRgpd !== budgetType) {
    console.log('***** ERROR **0** ')
    error = 'Ocorreu um erro nos parametros. Não foi possivel aceitar o seu pedido. Tente mais tarde ou entre em contato. Obrgado.'
    console.log(error, payload)
    console.log('***** ERROR **1** ')
    return resultOutput.resultOutputError(error)
  }
  return resultOutput.resultOutputSuccess(success)
}

async function budgetsRequest (context) {
    /**
    var resend = await sendEmailOndemand();
    */
    localContext = context

    const params = await checkParameters(localContext.main.REQ_INPUTS)    
    
    if (params && params.iook) {

      const budgetDoc = new budgets(localContext.main.REQ_INPUTS)
      budgetDoc.budgetClientIp = localContext.main.httpRequest.connection.remoteAddress
      budgetDoc.budgetDomain = localContext.main.httpRequest.headers.host
      budgetDoc.dateCreated = Date.now()
      budgetDoc.dateUpdated = Date.now()      
      const saveBudget = await budgetDoc.save().then(async function (docs) {
        
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
          bodymail += '<p>id: {{orcid}}</p>'.replace('{{orcid}}',  docs._id)
          bodymail += '<p>Data: {{date}}</p>'.replace('{{date}}', new Date)
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

          emaildata = {to: 'geral@safeclean.pt',subject: subject,html: bodymail}

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
    //console.log(getClientIp(context.main.httpRequest, context.main.httpResponse, context.main.next))
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
  },
  sendEmailOndemand : sendEmailOndemand
}

const listemails = [{ "_id" : "5c3e543e8d80e6dd6d03fb74", "budgetName" : "Sandra Gomes ", "budgetEmail" : "Sandragomes74@hotmail.com", "budgetMobile" : "965665980", "budgetStreet" : "Rua Vasco Santana ", "budgetPortNumber" : "17", "budgetCity" : "Qta da Seta ", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "4", "budgetRooms" : "1", "budgetWc" : "3", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-15T21:44:30.910Z", "dateUpdated" : "2019-01-15T21:44:30.910Z", "__v" : 0 },
  { "_id" : "5c3f5fe18d80e6dd6d03fb77", "budgetName" : "Marta Moniz", "budgetEmail" : "martamonizz@gmail.com", "budgetMobile" : "927202324", "budgetStreet" : "Estrada do Lumiar ", "budgetPortNumber" : "13", "budgetCity" : "Lisboa ", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "12", "budgetArea" : "115", "budgetWindows" : null, "budgetObserva" : "Boa tarde, \r\n\r\nVenho por este meio fazer um pedido de orçamento para limpeza doméstica regular para um T2 de 115m2 no Lumiar.\r\n\r\nPrecisava de preços para duas modalidades, \r\n\r\n1 vez por semana e de 15 em 15 dias.\r\n\r\nMuito obrigada. \r\nCumprimentos, \r\nMarta", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-01-16T16:46:25.287Z", "dateUpdated" : "2019-01-16T16:46:25.287Z", "__v" : 0 },
  { "_id" : "5c40a6868d80e6dd6d03fb78", "budgetName" : "Diana Guerreiro", "budgetEmail" : "guerreiro.diana@gmail.com", "budgetMobile" : "963 970 739", "budgetStreet" : "Av. Minas Gerais, nº 5 3º esq Figueirinha", "budgetPortNumber" : "5", "budgetCity" : "Oeiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "86", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\n\r\nGostaria de saber o preço de uma limpeza profunda ao apartamento T2 descrito. Nesta  limpeza profunda gostaria de saber se também limpam uma carpete da sala. \r\n\r\nObrigada,", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T16:00:06.239Z", "dateUpdated" : "2019-01-17T16:00:06.239Z", "__v" : 0 },
  { "_id" : "5c40a68a8d80e6dd6d03fb79", "budgetName" : "Diana Guerreiro", "budgetEmail" : "guerreiro.diana@gmail.com", "budgetMobile" : "963 970 739", "budgetStreet" : "Av. Minas Gerais, nº 5 3º esq Figueirinha", "budgetPortNumber" : "5", "budgetCity" : "Oeiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "86", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\n\r\nGostaria de saber o preço de uma limpeza profunda ao apartamento T2 descrito. Nesta  limpeza profunda gostaria de saber se também limpam uma carpete da sala. \r\n\r\nObrigada,", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T16:00:10.454Z", "dateUpdated" : "2019-01-17T16:00:10.454Z", "__v" : 0 },
  { "_id" : "5c41072c8d80e6dd6d03fb7a", "budgetName" : "Marcia Relvas ", "budgetEmail" : "mrelvas1983@gmail.com", "budgetMobile" : "924028029", "budgetStreet" : "Rua vitor damas lote 17 1 C", "budgetPortNumber" : "Lote 17", "budgetCity" : "Amadora", "budgetTipologia" : "Prédio ", "budgetFloor" : 4, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "4 pisos habitacionais. Agradeco que me informem se realizam limpezas a garagens. Pretende se limpeza 1x semana e limpeza de 3 pisos de garagens 2x ano, com maquina.\r\nPor favor resposta por mail", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LC", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T22:52:28.990Z", "dateUpdated" : "2019-01-17T22:52:28.990Z", "__v" : 0 },
  { "_id" : "5c41072f8d80e6dd6d03fb7b", "budgetName" : "Marcia Relvas ", "budgetEmail" : "mrelvas1983@gmail.com", "budgetMobile" : "924028029", "budgetStreet" : "Rua vitor damas lote 17 1 C", "budgetPortNumber" : "Lote 17", "budgetCity" : "Amadora", "budgetTipologia" : "Prédio ", "budgetFloor" : 4, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "4 pisos habitacionais. Agradeco que me informem se realizam limpezas a garagens. Pretende se limpeza 1x semana e limpeza de 3 pisos de garagens 2x ano, com maquina.\r\nPor favor resposta por mail", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LC", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T22:52:31.004Z", "dateUpdated" : "2019-01-17T22:52:31.004Z", "__v" : 0 },
  { "_id" : "5c4112428d80e6dd6d03fb7c", "budgetName" : "Ana aze8", "budgetEmail" : "Sofia-Azenha@hotmail.com", "budgetMobile" : "965050975", "budgetStreet" : "Vialonga", "budgetPortNumber" : "7", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::1", "dateCreated" : "2019-01-17T23:39:46.850Z", "dateUpdated" : "2019-01-17T23:39:46.850Z", "__v" : 0 },
  { "_id" : "5c4112468d80e6dd6d03fb7d", "budgetName" : "Ana aze8", "budgetEmail" : "Sofia-Azenha@hotmail.com", "budgetMobile" : "965050975", "budgetStreet" : "Vialonga", "budgetPortNumber" : "7", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-17T23:39:50.855Z", "dateUpdated" : "2019-01-17T23:39:50.855Z", "__v" : 0 },
  { "_id" : "5c41ad5c8d80e6dd6d03fb7e", "budgetName" : "Stela Suils Cuesta", "budgetEmail" : "stelasuils@gmail.com", "budgetMobile" : "911150402", "budgetStreet" : "Rua da Biscaia", "budgetPortNumber" : "392", "budgetCity" : "Biscaia", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "\r\nPor favor, envie um orçamento para uma limpeza semanal e que a mesma pessoa vem cada semana", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-18T10:41:32.881Z", "dateUpdated" : "2019-01-18T10:41:32.881Z", "__v" : 0 },
  { "_id" : "5c41ad608d80e6dd6d03fb7f", "budgetName" : "Stela Suils Cuesta", "budgetEmail" : "stelasuils@gmail.com", "budgetMobile" : "911150402", "budgetStreet" : "Rua da Biscaia", "budgetPortNumber" : "392", "budgetCity" : "Biscaia", "budgetTipologia" : "", "budgetFloor" : 2, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "\r\nPor favor, envie um orçamento para uma limpeza semanal e que a mesma pessoa vem cada semana", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::1", "dateCreated" : "2019-01-18T10:41:36.781Z", "dateUpdated" : "2019-01-18T10:41:36.781Z", "__v" : 0 },
  { "_id" : "5c45f25e8d80e6dd6d03fb84", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-21T16:25:02.970Z", "dateUpdated" : "2019-01-21T16:25:02.970Z", "__v" : 0 },
  { "_id" : "5c45f2608d80e6dd6d03fb85", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-21T16:25:04.120Z", "dateUpdated" : "2019-01-21T16:25:04.120Z", "__v" : 0 },
  { "_id" : "5c45f2618d80e6dd6d03fb86", "budgetName" : "Carla Branco Pires", "budgetEmail" : "cresende@tnmc.pt", "budgetMobile" : "918389776", "budgetStreet" : "Beloura Office Park Edf.2 Esc.5", "budgetPortNumber" : "2", "budgetCity" : "693", "budgetTipologia" : "escritório", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "", "budgetWc" : "", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Agradecemos orçamento para limpeza de divisórias em vidro de escritório.\r\nObg.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LE", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-01-21T16:25:05.735Z", "dateUpdated" : "2019-01-21T16:25:05.735Z", "__v" : 0 },
  { "_id" : "5c4af1c98d80e6dd6d03fb89", "budgetName" : "Envialia Portugal S.L. ", "budgetEmail" : "r.lucas@envialia.com", "budgetMobile" : "913139955", "budgetStreet" : "Zona Industrial da Granja , Armazém C6 Vialonga ", "budgetPortNumber" : "C6", "budgetCity" : "Vialonga", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Bom dia , \r\n\r\nVenho por este meio solicitar orçamento para limpeza da nossa plataforma logistica e escritório em Vialonga . \r\n\r\nMelhores cumprimentos,\r\nSaludos,\r\n\r\n \r\nRaul Silva Lucas\r\nResponsável de Desenvolvimento Comercial e Manutenção Portugal\r\n+351 913139955 - Zona Industrial da Granja, Armazém C6 – 2625-717 Vialonga \r\n          \r\n\r\n \r\nEste mensaje se dirige exclusivamente a su destinatario y puede contener información privilegiada o confidencial.\r\nSi no eres el destinatario indicado, queda notificado de que la lectura, utilización, divulgación y/o copia sin autorización está prohibida en virtud de la legislación vigente.\r\nSi has recibido este mensaje por error, te rogamos que nos lo comuniques inmediatamente por esta misma vía y procedas a su destrucción.\r\nEl correo electrónico vía Internet no permite asegurar la confidencialidad de los mensajes que se transmiten ni su integridad o correcta recepción.\r\nEnvialia no asume ninguna responsabilidad por estas circunstancias.\r\n\r\n\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LA", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-25T11:23:53.924Z", "dateUpdated" : "2019-01-25T11:23:53.924Z", "__v" : 0 },
  { "_id" : "5c4ca2758d80e6dd6d03fb8a", "budgetName" : "Mariana ", "budgetEmail" : "bragato.mariana@gmail.com", "budgetMobile" : "913160228", "budgetStreet" : "rua da paz, 10", "budgetPortNumber" : "2 direito", "budgetCity" : "lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "2", "budgetWc" : "2", "budgetArea" : "90", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-26T18:09:57.935Z", "dateUpdated" : "2019-01-26T18:09:57.936Z", "__v" : 0 },
  { "_id" : "5c4cdeca8d80e6dd6d03fb8b", "budgetName" : "Célia Rodrigues", "budgetEmail" : "ccrperdigao@gmail.com", "budgetMobile" : "935122046", "budgetStreet" : "Rua Mario Sottomayor Cardia", "budgetPortNumber" : "14", "budgetCity" : "Loures", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LPM", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-26T22:27:22.326Z", "dateUpdated" : "2019-01-26T22:27:22.326Z", "__v" : 0 },
  { "_id" : "5c4da1e08d80e6dd6d03fb8c", "budgetName" : "MARIA TERESA MAURICIO", "budgetEmail" : "irenemauricio@sapo.pt", "budgetMobile" : "968638078", "budgetStreet" : "RUA", "budgetPortNumber" : ".", "budgetCity" : "LINDA-A-PASTORA", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "3", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "50", "budgetWindows" : null, "budgetObserva" : "LIMPEZA BISSEMANAL ", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T3", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-01-27T12:19:44.163Z", "dateUpdated" : "2019-01-27T12:19:44.163Z", "__v" : 0 },
  { "_id" : "5c559d778d80e6dd6d03fb8f", "budgetName" : "Ana Santos", "budgetEmail" : "anolas@gmail.com", "budgetMobile" : "967940772", "budgetStreet" : "avenida elias garcia ", "budgetPortNumber" : "17", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "70", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-02T13:39:03.325Z", "dateUpdated" : "2019-02-02T13:39:03.325Z", "__v" : 0 },
  { "_id" : "5c57054d8d80e6dd6d03fb91", "budgetName" : "Luísa Mascarenhas", "budgetEmail" : "mascarenhas.mluisa@gmail.com", "budgetMobile" : "916 010 366", "budgetStreet" : "Avenida Grão Vasco", "budgetPortNumber" : "31", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "70 ", "budgetWindows" : null, "budgetObserva" : "Limpeza de paredes com fungos.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-03T15:14:21.857Z", "dateUpdated" : "2019-02-03T15:14:21.857Z", "__v" : 0 },
  { "_id" : "5c59f6448d80e6dd6d03fb92", "budgetName" : "Vera Costa", "budgetEmail" : "vera.dinis.costa@gmail.com", "budgetMobile" : "351932878284", "budgetStreet" : "Estrada de benfica", "budgetPortNumber" : "472", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Boa noite,\r\nPretendo obter orçamento para serviço de limpeza doméstica, 2xsemana (2f e 6f). À 2f seria para engomar roupa + arrumação e limpeza de 2WC e kitchenette e à 6f uma limpeza mais \"profunda\" de todas as divisões. É uma casa com 2 quartos, 2 WC, sala, kitchenette, marquise e varanda.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-05T20:47:00.280Z", "dateUpdated" : "2019-02-05T20:47:00.280Z", "__v" : 0 },
  { "_id" : "5c59f6458d80e6dd6d03fb93", "budgetName" : "Vera Costa", "budgetEmail" : "vera.dinis.costa@gmail.com", "budgetMobile" : "351932878284", "budgetStreet" : "Estrada de benfica", "budgetPortNumber" : "472", "budgetCity" : "Lisboa", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "2", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "Boa noite,\r\nPretendo obter orçamento para serviço de limpeza doméstica, 2xsemana (2f e 6f). À 2f seria para engomar roupa + arrumação e limpeza de 2WC e kitchenette e à 6f uma limpeza mais \"profunda\" de todas as divisões. É uma casa com 2 quartos, 2 WC, sala, kitchenette, marquise e varanda.", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-05T20:47:01.987Z", "dateUpdated" : "2019-02-05T20:47:01.987Z", "__v" : 0 },
  { "_id" : "5c5a0f618d80e6dd6d03fb94", "budgetName" : "maria", "budgetEmail" : "majoaoalvesserra@gmail.com", "budgetMobile" : "21212121212", "budgetStreet" : "oeiras", "budgetPortNumber" : "2", "budgetCity" : "0eiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-05T22:34:09.212Z", "dateUpdated" : "2019-02-05T22:34:09.212Z", "__v" : 0 },
  { "_id" : "5c5a0f658d80e6dd6d03fb95", "budgetName" : "maria", "budgetEmail" : "majoaoalvesserra@gmail.com", "budgetMobile" : "21212121212", "budgetStreet" : "oeiras", "budgetPortNumber" : "2", "budgetCity" : "0eiras", "budgetTipologia" : "", "budgetFloor" : 1, "budgetBedRooms" : "2", "budgetRooms" : "1", "budgetWc" : "1", "budgetArea" : "100", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::1", "dateCreated" : "2019-02-05T22:34:13.783Z", "dateUpdated" : "2019-02-05T22:34:13.783Z", "__v" : 0 },
  { "_id" : "5c5ad4678d80e6dd6d03fb97", "budgetName" : "Raquel Lamy", "budgetEmail" : "lamy.ana.raquel@gmail.com", "budgetMobile" : "965713832", "budgetStreet" : "Arruda dos vinhos", "budgetPortNumber" : ".", "budgetCity" : ".", "budgetTipologia" : "Quinta ", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : ".", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\nPretendo orçamento para limpeza profunda, higienizar ao máximo uma Quinta em Arruda dos Vinhos que em tempos esteve a funcionar.\r\nSerão 6 divisões, em que 3 têm mais ou menos 118m2, outra tem 220m2 e as outras duas devem ter cerca de 60m2.\r\n\r\nObrigada,\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::1", "dateCreated" : "2019-02-06T12:34:47.429Z", "dateUpdated" : "2019-02-06T12:34:47.429Z", "__v" : 0 },
  { "_id" : "5c5ad4698d80e6dd6d03fb98", "budgetName" : "Raquel Lamy", "budgetEmail" : "lamy.ana.raquel@gmail.com", "budgetMobile" : "965713832", "budgetStreet" : "Arruda dos vinhos", "budgetPortNumber" : ".", "budgetCity" : ".", "budgetTipologia" : "Quinta ", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : ".", "budgetWindows" : null, "budgetObserva" : "Boa tarde,\r\nPretendo orçamento para limpeza profunda, higienizar ao máximo uma Quinta em Arruda dos Vinhos que em tempos esteve a funcionar.\r\nSerão 6 divisões, em que 3 têm mais ou menos 118m2, outra tem 220m2 e as outras duas devem ter cerca de 60m2.\r\n\r\nObrigada,\r\n", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "TT", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T12:34:49.629Z", "dateUpdated" : "2019-02-06T12:34:49.629Z", "__v" : 0 },
  { "_id" : "5c5b54438d80e6dd6d03fb9b", "budgetName" : "OSCAR MARTINS", "budgetEmail" : "oscarrafaelcampos@gmail.com", "budgetMobile" : "913859014", "budgetStreet" : "ALAMEDA DA GUIA, N 192 - 4F", "budgetPortNumber" : "0", "budgetCity" : "CASCAIS", "budgetTipologia" : "", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : "0", "budgetWindows" : null, "budgetObserva" : "Teste fómulario", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::1", "dateCreated" : "2019-02-06T21:40:19.086Z", "dateUpdated" : "2019-02-06T21:40:19.086Z", "__v" : 0 },
  { "_id" : "5c5b54468d80e6dd6d03fb9c", "budgetName" : "OSCAR MARTINS", "budgetEmail" : "oscarrafaelcampos@gmail.com", "budgetMobile" : "913859014", "budgetStreet" : "ALAMEDA DA GUIA, N 192 - 4F", "budgetPortNumber" : "0", "budgetCity" : "CASCAIS", "budgetTipologia" : "", "budgetFloor" : 0, "budgetBedRooms" : "0", "budgetRooms" : "0", "budgetWc" : "0", "budgetArea" : "0", "budgetWindows" : null, "budgetObserva" : "Teste fómulario", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T1", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T21:40:22.309Z", "dateUpdated" : "2019-02-06T21:40:22.309Z", "__v" : 0 },
  { "_id" : "5c5b55e08d80e6dd6d03fb9e", "budgetName" : "Judith Santos ", "budgetEmail" : "Judithsantosco28@gmail.com", "budgetMobile" : "927027717", "budgetStreet" : "Praça Bento Gonçalves ", "budgetPortNumber" : "3", "budgetCity" : "Vialinga", "budgetTipologia" : "", "budgetFloor" : 5, "budgetBedRooms" : "6", "budgetRooms" : "3", "budgetWc" : "4", "budgetArea" : "", "budgetWindows" : null, "budgetObserva" : "", "budgetType" : 20, "budgetDomain" : "orcseven.com", "budgetSeviceType" : "LD", "budgetTipologiaSelect" : "T2", "budgetClientIp" : "::ffff:127.0.0.1", "dateCreated" : "2019-02-06T21:47:12.163Z", "dateUpdated" : "2019-02-06T21:47:12.163Z", "__v" : 0 }];

async function sendEmailOndemand (listemails) {
  var filter = [];
  for (var e = 0; e < listemails.length; e++) {
    var docs = listemails[e];

    if (filter.indexOf(docs.budgetEmail) >= 0) {
      continue;
    } 

    filter.push(docs.budgetEmail);

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
      bodymail += '<p>id: {{orcid}}</p>'.replace('{{orcid}}',  docs._id)
      bodymail += '<p>Data: {{date}}</p>'.replace('{{date}}', new Date(docs.dateCreated))
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
    }
  }

  return this;

}

module.exports = local
