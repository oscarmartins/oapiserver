const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bannersSchema = new Schema({
    banner_id: {type: Schema.Types.ObjectId, required: true},
    recid: {type: Number, required: true},
    name: {type: String, required: true},
    toptitle: {type: String},
    subtitle: {type: String},
    labelbtn: {type: String},
    urlbtn: {type: String},
    sdate: {type: Date},
    userid: {type: String}
})

module.exports = mongoose.model('Banners', bannersSchema)            