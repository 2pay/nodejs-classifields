var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var schemaCategory = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    name: { type: String },
    child: [{ type: String }],
    level: { type: Number },
    status: { type: String }
}, { timestamps: true });

schemaCategory.virtual('id').get(function() {
    return this._id.toHexString();
});

schemaCategory.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', schemaCategory);