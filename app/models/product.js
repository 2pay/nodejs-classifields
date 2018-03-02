const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const schemaProduct = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    poster: String,
    categories: [{
        type: String
    }],
    name: { type: String },
    thumbs: [{
        small: String,
        medium: String,
        large: String
    }],
    slug: { type: String },
    desc: { type: String },
    price_range: [{
        cost: {
            type: Number,
            default: 0
        },
        from: {
            type: Number,
            default: 0
        },
        to: {
            type: Number,
            default: 0
        }
    }],
    sku: { type: String },
    point: { type: Number, default: 0 },
    status: { type: String }
}, { timestamps: true });

schemaProduct.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', schemaProduct);