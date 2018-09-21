const mongoose = require('mongoose')
const Schema = mongoose.Schema

const standblog = new Schema({
  pubName: {type: 'String'},
  pubMarca: {type: String },
  pubAC: {type: String },
  pubAnoRegisto: { type: Number },
  pubCilindrada: { type: String },
  pubColor: { type: String },
  pubCombustivel: { type: String },
  pubCondStatus: { type: String },
  pubCreateDate: { type: String },
  pubLotacao: { type: Number },
  pubMesRegisto: { type: String },
  pubModelo: {type: String },
  pubNPorts: { type: Number },
  pubPotencia: { type: String },
  pubQuilometros: { type: String },
  pubStand: { type: String },
  pubVersao: { type: String },
  pubGalery: {type: Array},
  published: {type: Boolean },
  dateCreated: { type: Date },
  dateUpdated: { type: Date }
})

module.exports = mongoose.model('Standblog', standblog)
