const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaDistrict = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    id: String,
    id_province: String,
    name: String,
    type: String
}, { timestamps: true });

module.exports = mongoose.model('District', schemaDistrict);