const Joi = require('joi')

const outputOpt = function (isok, error, errors) {
    return {isok: isok, error: error, errors: errors}
}
const schemas = {
  accountRecovery: {
    checkEmail: {email: Joi.string().email({ minDomainAtoms: 2 }).required()},
    checkSecret: {
      secret: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$')).required().options({
        language: {
          string: {
            regex: {
              base: 'with value ******* fails to match the required pattern: /^[a-zA-Z0-9]{8,32}$/ '
            }
          }
        }
      }),
      confirmSecret: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$')).required().valid(Joi.ref('secret')).options({
        language: {
          string: {
            regex: {
              base: 'with value ******* fails to match the required pattern: /^[a-zA-Z0-9]{8,32}$/ '
            }
          },
          any: {
            allowOnly: '!!Passwords do not match'
          }
        }
      })
    }
  },
  signin: {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    secret: Joi.string().required()
  },
  signup: {
    name: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    mobile: Joi.string().min(9).max(14),
    secret: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$')).required().options({
        language: {
          string: {
            regex: {
              base: 'with value ******* fails to match the required pattern: /^[a-zA-Z0-9]{8,32}$/ '
            }
          }
        }
    }),
    confirmSecret: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$')).required().valid(Joi.ref('secret')).options({
        language: {
          string: {
            regex: {
              base: 'with value ******* fails to match the required pattern: /^[a-zA-Z0-9]{8,32}$/ '
            }
          },
          any: {
            allowOnly: '!!Passwords do not match'
          }
        }
    })
  }
}

function adapter (schema, inputs) {
  const {error} = Joi.validate(inputs, schema)
  if (error) {
    return outputOpt(false, error.details, error.details[0].message)
  }    
  return outputOpt(true)
}

function signup (inputs) {  
  return adapter(schemas.signup, inputs)
}

function signin (inputs) {  
  return adapter(schemas.signin, inputs)
}
function accountRecovery (inputs, mode) {
  return adapter(schemas.accountRecovery[mode === 1 ? 'checkEmail' : 'checkSecret'], inputs)
}
module.exports = {
  signup: signup,
  signin: signin,
  accountRecovery: accountRecovery,
  ACCOUNT_STATUS_DISABLED: -100,
  ACCOUNT_STATUS_ENABLED: 100,
  ACCOUNT_STATUS_ON_VALIDATION: 200,
  ACCOUNT_STATUS_ON_TOKEN_VALIDATION: 300,
  USER_TYPE_TESTER: 3000,
  USER_TYPE_BACK_OFFICE: 2000,
  USER_TYPE_ADMIN: 1000,
  USER_TYPE_USER: 500,
  USER_TYPE_GUEST: 100
}