const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

const userSchema = new Schema({
  name: {type: String},
  email: {type: String, required: true},
  secret: {type: String, required: true},
  groupid: {type: String}
})

userSchema.methods.encryptsecret = function (secret) {
  return bcrypt.hashSync(secret, bcrypt.genSaltSync(5), null)
}

userSchema.methods.validsecret = function (secret) {
  return bcrypt.compareAsync(secret, this.secret)
}

module.exports = mongoose.model('CRMUSERS', userSchema)