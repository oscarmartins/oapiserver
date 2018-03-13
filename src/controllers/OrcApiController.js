const main = this
main['httpRequest'] = null
main['httpResponse'] = null
main['REQ_CONTEX'] = 0
main['REQ_ACTION'] = 0
main['REQ_INPUTS'] = {}

async function preparams () {
  let msg = null
  if (!main.httpRequest) { msg = 'Error [Http] [missing httpRequest]' }
  if (!main.httpResponse) { msg = 'Error [Http] [missing httpResponse]' }
  const body = main.httpRequest.body
  const {REQ_CONTEX, REQ_ACTION, REQ_INPUTS} = body
  if (!REQ_CONTEX) { msg = 'Error [Parameter] [missing REQ_CONTEXT]' }
  if (!REQ_ACTION) { msg = 'Error [Parameter] [missing REQ_ACTION]' }
  if (!REQ_INPUTS) { msg = 'Error [Parameter] [missing REQ_INPUTS]' }
  if (msg) { return {isok: false, error: msg} }
  main.REQ_CONTEX = REQ_CONTEX
  main.REQ_ACTION = REQ_ACTION
  main.REQ_INPUTS = REQ_INPUTS
  /** use debug mode */
  console.log(main.REQ_CONTEX, main.REQ_ACTION, main.REQ_INPUTS)
  return {isok: true, error: msg}
}

const instance = {
  main: main,
  preparams: await preparams
}

module.exports = instance
