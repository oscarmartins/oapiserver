const mongoose = require('mongoose')
const Schema = mongoose.Schema
/**
 * budgetType [1 budget] [2 contact request]
 */
const budgets = new Schema({
    budgetClientIp: {type: 'String'},
    budgetDomain: {type: String },
    budgetType: {type: Number },
    budgetName: { type: String },
    budgetEmail: { type: String },
    budgetMobile: { type: String },
    budgetStreet: { type: String },
    budgetCity: { type: String },
    budgetSeviceType: { type: String },
    budgetTipologiaSelect: { type: String },
    budgetTipologia: { type: String },
    budgetFloor: {type: Number },
    budgetBedRooms: { type: String },
    budgetRooms: { type: String },
    budgetWc: { type: String },
    budgetArea: { type: String },
    budgetObserva: { type: String },
    budgetWindows: {type: Number },
    budgetPortNumber: {type: String },
    dateCreated: { type: Date },
    dateUpdated: { type: Date }
  })

module.exports = mongoose.model('Budgets', budgets)
