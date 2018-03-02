const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaProvince = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    id: String,
    name: String,
    type: String,
    country: String
}, { timestamps: true });

module.exports = mongoose.model('Province', schemaProvince);