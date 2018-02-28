const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customerSchema = new Schema({
  user_id: {type: Schema.Types.ObjectId, required: true, index: {unique: true, sparse: true}},
  firstName: {type: String, default: '', required: true},
  lastName: {type: String, default: '', required: true},
  birthDate: {type: String, default: '', required: true},
  gender: {type: String, default: ''},
  nid: {type: String, default: null},
  nif: {type: String, default: null},
  nib: {type: String, default: null},
  street: {type: String, default: ''},
  zipcode: {type: String, default: ''},
  city: {type: String, default: ''},
  country: {type: String, default: ''},
  email: {type: String, default: '', required: true, index: {unique: true, sparse: true}},
  phoneNumber: {type: String, default: ''},
  mobileNumber: {type: String, default: '', required: true},
  dateCreated: {type: Date},
  dateUpdated: {type: Date}
})

customerSchema.pre('save', async function (next) {
  const $self = this
  if (!$self.isNew) {
    // return next(new Error(' nao podes fazer save em doc existente'))
  }
  const ignoredId = $self._id
  if ($self.nid && await isUnique({nid: $self.nid}, ignoredId)) {
    return next(new Error('O campo Número de Identificação Pessoal já se encontra registado em outra conta.'))
  }
  if ($self.nif && await isUnique({nif: $self.nif}, ignoredId)) {
    return next(new Error('O campo Número de Identificação Fiscal já se encontra registado em outra conta.'))
  }
  if ($self.nib && await isUnique({nib: $self.nib}, ignoredId)) {
    return next(new Error('O campo Número de Identificação Bancária já se encontra registado em outra conta.'))
  }
  if ($self.phoneNumber && await isUnique({phoneNumber: $self.phoneNumber}, ignoredId)) {
    return next(new Error('O campo Número Telefone já se encontra registado em outra conta.'))
  }
  if ($self.mobileNumber && await isUnique({mobileNumber: $self.mobileNumber}, ignoredId)) {
    return next(new Error('O campo Número Telemovel já se encontra registado em outra conta.'))
  }
  return next()
})

const Customer = mongoose.model('Customer', customerSchema)

async function isUnique (criteria, ignoredId) {
  const query = await Customer.find(criteria)
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

module.exports = Customer
