var Buffer = require('safe-buffer').Buffer
const listaNomes = ['Oscar Martins', 'Melissa Martinez', 'Usert Test']
const listaTelemoveis = ['+3519138', '+3519139', '+3519139']
var listaNomesCache = []
var listaTelemoveisCache = []
var smsTextTemplate = null

function cleanUpSpecialChars (str) {
  str = str.replace(/[ÀÁÂÃÄÅ]/g, 'A')
  str = str.replace(/[àáâãäå]/g, 'a')
  str = str.replace(/[ÈÉÊË]/g, 'E')
  str = str.replace(/[èéêë]/g, 'e')
  str = str.replace(/[ìíîï]/g, 'i')
  str = str.replace(/[ÌÍÎÏ]/g, 'I')
  str = str.replace(/[ç]/g, 'c')
  str = str.replace(/[Ç]/g, 'C')
  str = str.replace(/[€]/g, 'EUR')
  str = str.replace(/[ºª]/g, '')
  return str
}

function knowMobileByName (name) {
  for (var np = 0; np < listaNomes.length; np++) {
    if (name === listaNomes[np]) {
      return listaTelemoveis[np]
    }
  }
  return null
}

function knowNameByMobile (mobile) {
  for (var np = 0; np < listaTelemoveis.length; np++) {
    if (mobile === listaTelemoveis[np]) {
      return listaNomes[np]
    }
  }
  return null
}

function nextChoice (arrayLista) {
  return arrayLista[Math.floor(((Math.random() * arrayLista.length))) || 0]
}

function checkDuplicates (arr, justCheck) {
  var len = arr.length
  var tmp = {}
  var arrtmp = arr.slice()
  var dupes = []
  arrtmp.sort()
  while (len--) {
    var val = arrtmp[len]
    if (/nul|nan|infini/i.test(String(val))) {
      val = String(val)
    }
    if (tmp[JSON.stringify(val)]) {
      if (justCheck) {
        return true
      }
      dupes.push(val)
    }
    tmp[JSON.stringify(val)] = true
  }
  return justCheck ? false : dupes.length ? dupes : null
}

function sorteio (lista, listaCache) {
  const value = nextChoice(lista)
  if (listaCache.indexOf(value) > -1) {
    return sorteio(lista, listaCache)
  } else {
    listaCache.push(value)
  }
  return value
}

function mobileSort (name) {
  const mobile = knowMobileByName(name)
  var insort = true
  var _mobileSort = null
  while (insort) {
    _mobileSort = nextChoice(listaTelemoveis)
    if (_mobileSort === mobile) {
      if (listaTelemoveisCache.indexOf(_mobileSort) <= -1 && listaTelemoveisCache.length === (listaTelemoveis.length - 1)) {
        listaTelemoveisCache.push(_mobileSort)
        insort = false
        var tmpLst = listaTelemoveisCache.slice(0)
        listaTelemoveisCache[listaTelemoveisCache.length - 2] = tmpLst[tmpLst.length - 1]
        listaTelemoveisCache[listaTelemoveisCache.length - 1] = tmpLst[tmpLst.length - 2]
      }
      continue
    } else {
      if (listaTelemoveisCache.indexOf(_mobileSort) > -1) {
        if (listaTelemoveisCache.length === listaNomesCache.length) {
          insort = false
        }
        continue
      }
      listaTelemoveisCache.push(_mobileSort)
      insort = false
    }
  }
  return listaTelemoveisCache
}

function smsTextTemplates (name, secretFriendMobile) {
  const template = smsTextTemplate || ''
  let msgsms = ('Olá {{name}}, tudo bem?? ').replace('{{name}}', name)
  if (template === 'cool') {
    msgsms = ('Olá {{name}}, o teu amigo(a) secreto(a) é {{mobileName}}. ').replace('{{name}}', name).replace('{{mobileName}}', knowNameByMobile(secretFriendMobile))
    msgsms += 'Valor máx. do presente é de 5€. '
    msgsms += 'O jantar é na Baía-do-Peixe na prox. 4ªfeira ás 20h00.'
    console.log(msgsms.length)
  } else if (template === 'myfamily') {
    msgsms = ('Olá {{name}}, o teu amigo(a) secreto(a) é {{mobileName}}. ').replace('{{name}}', name).replace('{{mobileName}}', knowNameByMobile(secretFriendMobile))
    msgsms += 'O valor máx. do presente é de 5€. '
    msgsms += 'Boas festas.'
  }
  return msgsms
}

function preSorteio () {
  listaNomesCache = []
  listaTelemoveisCache = []
  while (listaNomesCache.length < listaNomes.length) {
    sorteio(listaNomes, listaNomesCache)
  }
  for (var np = 0; np < listaNomesCache.length; np++) {
    mobileSort(listaNomesCache[np])
  }

  let msgsms
  const allmsg = []
  for (var ts = 0; ts < listaNomesCache.length; ts++) {
    var name = listaNomesCache[ts]
    var mobileNameTo = listaTelemoveisCache[ts]
    msgsms = smsTextTemplates(name, mobileNameTo)
    var buffer = new Buffer(cleanUpSpecialChars(msgsms), 'utf8')
    allmsg.push({to: knowMobileByName(name), msg: buffer.toString('utf8')})
  }
  return allmsg
}

async function notificator (sorteioFinal) {
  const BulkSMS = require('./BulkSMS')
  const sms = new BulkSMS(instance.username, instance.password)
  let resultados = []
  for (var tx = 0; tx < sorteioFinal.length; tx++) {
    const msgobj = sorteioFinal[tx]
    const smsResponse = await sms.sendTextMessage(msgobj.to, msgobj.msg)
    if (smsResponse) {
      resultados.push(smsResponse)
    }
  }
  return resultados
}
const instance = {
  username: '',
  password: '',
  credentials (username, password) {
    this.username = username
    this.password = password
  },
  setSmsTextTemplate (_smsTextTemplate) {
    smsTextTemplate = _smsTextTemplate
  },
  clearContactsNames () {
    listaNomes.splice(0, listaNomes.length)
  },
  clearContactsNamesCache () {
    listaNomesCache.splice(0, listaNomesCache.length)
  },
  clearContactsMobiles () {
    listaTelemoveis.splice(0, listaTelemoveis.length)
  },
  clearContactsMobilesCache () {
    listaTelemoveisCache.splice(0, listaTelemoveisCache.length)
  },
  clearContactsAndCaches () {
    this.clearContactsNames()
    this.clearContactsNamesCache()
    this.clearContactsMobiles()
    this.clearContactsMobilesCache()
  },
  /**
   * 
   * @param {*} objContacts 
   * [{
   *  nome: string 
   *  mobile: string country id + mobile number
   * }]
   */
  adicionarListaContactos (arrayObjects) {
    this.clearContactsAndCaches()
    arrayObjects.forEach((contact) => {
      Object.keys(contact).forEach(function (key) {
        var value = contact[key]
        if (key === 'name') {
          listaNomes.push(value)
        } else if (key === 'mobile') {
          listaTelemoveis.push(value)
        }
      })
    })
  },
  adicionarListaNomes (objNomes) {
    console.log(objNomes)
  },
  adicionarListaMobile (objMobile) {
    console.log(objMobile)
  },
  async sentBulkSms () {
    const resume = {
      status: 200,
      output: {
        copy_sorteio: [],
        log_notifications: []
      }
    }
    try {
      let duplicates = checkDuplicates(listaNomes)
      if (duplicates && duplicates.length !== 0) {
        throw new Error(`Error: não podem existir nomes repetidos. ${duplicates.toString()}`)
      }
      duplicates = checkDuplicates(listaTelemoveis)
      if (duplicates && duplicates.length !== 0) {
        throw new Error(`Error: não podem existir números repetidos. ${duplicates.toString()}`)
      }
      const sorteioSemiFinal = []
      var _tempPreSorteio = null
      var counterDown = 20
      while (counterDown !== 0) {
        _tempPreSorteio = preSorteio()
        sorteioSemiFinal.push(_tempPreSorteio)
        counterDown--
      }
      const sorteioFinal = nextChoice(sorteioSemiFinal)
      resume.output.copy_sorteio = sorteioFinal
      const notificationsReport = await notificator(sorteioFinal)
      if (notificationsReport && notificationsReport.length !== 0) {
        resume.output.log_notifications = notificationsReport
      }
    } catch (error) {
      console.log(error)
      resume.status = 400
      resume.output = error.message
    }
    return resume
  }
}
module.exports = instance
