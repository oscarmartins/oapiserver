const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

/**
 * status: {
            0: offline,
            1: online
            }
 */

const schema = new Schema({
    groupname: {type:String},
    groupid: {type: Number},
    status: {type: Number},
})

const schemaValidator = {
    save: async function save (next) {
        const $self = this
        if (!$self.isNew) {
            // return next(new Error(' nao podes fazer save em doc existente'))
        }
        const ignoredId = $self._id
        if ($self.groupid && $self.groupname) {
            if (await isUnique({groupid: $self.groupid, groupname: $self.groupname}, ignoredId)) {
                return next(new Error(`Este grupo: ( Group Name=${$self.groupname} - Group ID=${$self.groupid} ) ja se encontra registado.`))
            }
        } else {
            return next(new Error('Os campos Group Name e Group ID são de preenchimento obrigatório.'))
        }
        return next()
    }
}

schema.pre('save', schemaValidator.save)

const crmusersgroups = mongoose.model('CRMUSERSGROUPS', schema)

async function isUnique (criteria, ignoredId) {
    const query = await crmusersgroups.find(criteria)
    const validator = []
    if (query && query.length !== 0) {
      for (var nx = 0; nx < query.length; nx++) {
        if (query[nx]._id.getTimestamp().toString() !== ignoredId.getTimestamp().toString()) {
          validator.push(query[nx]._id)
        }
      }
    }
    return validator.length !== 0
}

module.exports = crmusersgroups