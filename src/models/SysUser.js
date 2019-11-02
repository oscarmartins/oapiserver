const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

const sysUserSchema = new Schema({
  name: {type: String},
  email: {type: String, required: true, unique : true},
  mobile: {type: String, required: true, unique : true},
  secret: {type: String, required: true},
  type: {type: Number, required: true},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
})

sysUserSchema.statics.encryptPassword = function (secret) {
  return bcrypt.hashSync(secret, bcrypt.genSaltSync(5), null)
}

sysUserSchema.methods.validPassword = function (secret) {
  return bcrypt.compareAsync(secret, this.secret)
}

sysUserSchema.pre('save', async function (next) {
  const $self = this
  if (!$self.isNew) {
    // return next(new Error(' nao podes fazer save em doc existente'))
  }
  $self.secret = $self.schema.statics.encryptPassword($self.secret)
  $self.dateCreated = $self.dateUpdated = Date.now()
  return next()
})

module.exports = mongoose.model('SysUser', sysUserSchema)