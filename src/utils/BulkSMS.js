const rp = require('request-promise')
var splitter = require('split-sms')

function statusDescription (code) {
  let statusText = ''
  switch (code) {
    case 11: statusText = 'Delivered to mobile'
      break
    case 22: statusText = 'Internal fatal error'
      break
    case 23: statusText = 'Authentication failure'
      break
    case 24: statusText = 'Data validation failed'
      break
    case 25: statusText = 'You do not have sufficient credits'
      break
    case 26: statusText = 'Upstream credits not available'
      break
    case 27: statusText = 'You have exceeded your daily quota'
      break
    case 28: statusText = 'Upstream quota exceeded'
      break
    case 29: statusText = 'Message sending cancelled'
      break
    case 31: statusText = 'Unroutable'
      break
    case 32: statusText = 'Blocked (probably because of a recipient’s complaint against you)'
      break
    case 33: statusText = 'Failed: censored'
      break
    case 50: statusText = 'Delivery failed - generic failure'
      break
    case 51: statusText = 'Delivery to phone failed'
      break
    case 52: statusText = 'Delivery to network failed'
      break
    case 53: statusText = 'Message expired'
      break
    case 54: statusText = 'Failed on remote network'
      break
    case 55: statusText = 'Failed: remotely blocked (variety of reasons)'
      break
    case 56: statusText = 'Failed: remotely censored (typically due to content of message)'
      break
    case 57: statusText = 'Failed due to fault on handset (e.g. SIM full)'
      break
    case 64: statusText = 'Queued for retry after temporary failure delivering, due to fault on handset (transient)'
      break
    case 70: statusText = 'Unknown upstream status'
      break
  }
  return statusText
}
module.exports = class BulkSMS {
  constructor (user, pass) {
    if (arguments.length !== 2) {
      throw new Error('Expected 2 arguments: username and password')
    }
    this.user = user
    this.pass = pass
  }
  async sendTextMessage (msisdn, message) {
    const validateMessage = splitter.split(message)
    if (validateMessage.parts.length !== 1) {
      return {iook: false, success: null, error: `mensagem ultrapassa os caracteres permitidos. ${JSON.stringify(validateMessage)}`}
    }

    var options = {
      method: 'POST',
      uri: 'https://bulksms.vsms.net/eapi/submission/send_sms/2/2.0',
      headers: [
        {
          name: 'content-type',
          value: 'application/x-www-form-urlencoded'
        }
      ],
      form: {
        username: this.user,
        password: this.pass,
        message: message,
        msisdn: msisdn,
        sender: 'orcseven'
      }
    }
    const result = await rp(options).then(function (body) {
      let output = {iook: true, success: null, error: null}
      try {
        const raw = body.split('|')
        if (raw.length === 3) {
          const bodyResult = { code: Number(raw[0]), status: raw[1], batch_id: Number(raw[2]) }
          if (bodyResult.code !== 0) {
            throw new Error(`${statusDescription(bodyResult.code)} >> status: ${JSON.stringify(bodyResult.status)}`)
          }
          output.success = `success TO:${msisdn} / RESULT: ${JSON.stringify(bodyResult)}`
        }
      } catch (error) {
        output.iook = false
        output.error = `Error TO:${msisdn} MESSAGE: ${error.message} `
      }
      return output
    }).catch(function (err) {
      return err
    })
    return result
  }
}
