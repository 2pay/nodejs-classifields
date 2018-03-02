const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaCountry = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    id: String,
    name: String,
    code: String,
    status: String
}, { timestamps: true });

module.exports = mongoose.model('Country', schemaCountry);