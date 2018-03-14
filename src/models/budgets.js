const mongoose = require('mongoose')
const Schema = mongoose.Schema
/**
 * budgetType [1 budget] [2 contact request]
 */
const budgets = new Schema({
    budgetDomain: {type: String },
    budgetType: {type: Number },
    budgetName: { type: String },
    budgetEmail: { type: String },
    budgetMobile: { type: String },
    budgetStreet: { type: String },
    budgetCity: { type: String },
    budgetSeviceType: { type: String },
    budgetBedRooms: { type: String },
    budgetRooms: { type: String },
    budgetWc: { type: String },
    budgetArea: { type: String },
    budgetObserva: { type: String },
    dateCreated: { type: Date },
    dateUpdated: { type: Date }
  })

module.exports = mongoose.model('Budgets', budgets)
