const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sysAccountsStatusSchema = new Schema({
  label: {type: String, required: true, unique : true},
  status: {type: Number, required: true, unique : true},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
})

sysAccountsStatusSchema.pre('save', async function (next) {
  const $self = this
  if (!$self.isNew) {
    // return next(new Error(' nao podes fazer save em doc existente'))
  }
  $self.dateCreated = $self.dateUpdated = Date.now()
  return next()
})

module.exports = mongoose.model('SysAccountsStatus', sysAccountsStatusSchema)