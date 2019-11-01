const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sysAccountsSchema = new Schema({
  sysUserId: {type: Schema.Types.ObjectId, required: true},
  status: {type: Number, required: true},
  token: {type: String},
  appContext: {type: Number},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
})
sysAccountsSchema.pre('save', async function (next) {
  const $self = this
  if (!$self.isNew) {
    // return next(new Error(' nao podes fazer save em doc existente'))
  }
  $self.dateCreated = $self.dateUpdated = Date.now()
  return next()
})
module.exports = mongoose.model('SysAccounts', sysAccountsSchema)