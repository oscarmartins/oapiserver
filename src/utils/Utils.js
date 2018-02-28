function resultOutput (iook, success, error, data) {
  return {
    iook: iook,
    success: success,
    error: error,
    data: data || null
  }
}

function tokenRequestVerify (httpRequest) {
  const authorization = httpRequest.headers.authorization
  return tokenVerify(authorization && authorization.split(' ')[0] === 'Bearer' ? authorization.split(' ')[1] : null)
}

function tokenVerify (token) {
  if (token) { // Token is present
    if (token.split('.').length === 3) { // Token with a valid JWT format XXX.YYY.ZZZ
      try { // Could be a valid JWT or an access token with the same format
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        const exp = JSON.parse(window.atob(base64)).exp
        if (typeof exp === 'number') { // JWT with an optonal expiration claims
          return Math.round(new Date().getTime() / 1000) < exp
        }
      } catch (e) {
        return true // Pass: Non-JWT token that looks like JWT
      }
    }
    return true // Pass: All other tokens
  }
  return false
}

const INSTANCE = {
  resultOutput: {
    resultOutputSuccess: (success) => { return resultOutput(true, success, null, null) },
    resultOutputError: (error) => { return resultOutput(false, null, error, null) },
    resultOutputDataOk: (data) => { return resultOutput(true, null, null, data) },
    resultOutputDataError: (data) => { return resultOutput(false, null, null, data) }
  },
  jwtToken: {
    tokenVerify: token => { return tokenVerify(token) },
    tokenRequestVerify: httpRequest => { return tokenRequestVerify(httpRequest) }
  }
}
module.exports = INSTANCE
