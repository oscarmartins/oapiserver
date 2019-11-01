const Joi = require('joi')
const outputOpt = function (isok, error, errors) {
    return {isok: isok, error: error, errors: errors}
}
var output = null;
const schemas = {
    signup: {
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
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

function signup (inputs) {
    const {error} = Joi.validate(inputs, schemas.signup)
    if (error) {
        return outputOpt(false, error.details, error.details[0].message);
    }    
    return outputOpt(true);
}

module.exports = {
    signup: signup
}