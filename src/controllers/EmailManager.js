const knex = require('../config/knex')
const mailer = require('../models/mailer').schema()
const utils = require('../utils/Utils')
const responsedata = utils.resultOutput.resultOutputDataOk({})
const orcmailer = {
    new: async function (data) {

    },
    update: async function (data) {

    },
    remove: async function (data) {

    },
    fetchProfiles: async function (data) {

    },
    retrieveProfileById: async function (data) {

    }
}
const instance = {
    execute: async function (orcapicontroller) {
        try {
            if ( orcapicontroller ) {

            } else {
                new Error('Erro no parametro do construtor ')
            }
        } catch (error) {
            outdata.iook = false
            outdata.error = error.message
            outdata.data = null
        }
    }
}
module.exports = instance
