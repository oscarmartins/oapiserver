const uuid = require('uuid')

// ... using predefined DNS namespace (for domain names) 
function generate () {
  const secret = new Date().getTime()
  console.log(secret)
  const email = 'oscarrafaelcampos@gmail.com'
  return '{{email}}{{secret}}'.replace('{{email}}', email).replace('{{secret}}', secret)
}

for (var t = 0; t < 5; t++) {
  const test = uuid()
  console.log(test)
}

/**
 * Acusamos a receção da sua inscrição e agradecemos o seu contacto. 
 * Será brevemente contactado pela  a confirmar a realização da iniciativa.
 * Para qualquer dúvida ou esclarecimento poderá contactar-nos através do email: 
 */
