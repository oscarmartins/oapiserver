const mongoose = require('mongoose')
const Schema = mongoose.Schema

const accountSchema = new Schema({
  user_id: {type: Schema.Types.ObjectId, required: true},
  accountStatus: {type: Number, required: true},
  nextStage: {type: Number, required: true},
  code: {type: String},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
})

module.exports = mongoose.model('Accounts', accountSchema)
