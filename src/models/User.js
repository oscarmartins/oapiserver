const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

const userSchema = new Schema({
  name: {type: String},
  email: {type: String, required: true},
  password: {type: String, required: true}
})

userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
}

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareAsync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
