var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    info: {
        firstname: String,
        lastname: String,
        phone: String,
        company: String,
        address: String,
        cities: [{ type: Schema.ObjectId, ref: 'City' }],
        countries: [{ type: Schema.ObjectId, ref: 'Country' }]
    },
    local: {
        email: String,
        password: String,
        adminPin: String,
        activeToken: String,
        activeExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        photo: String
    },
    newsletter: Boolean,
    roles: String,
    status: String
}, {
    timestamps: true
});

memberSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

memberSchema.methods.validPassword = function(password) {
    return Boolean(this.local && this.local.password) && bcrypt.compareSync(password, this.local.password);
};

memberSchema.methods.validPincode = function(pincode) {
    return Boolean(this.local && this.local.adminPin) && bcrypt.compareSync(pincode, this.local.adminPin);
};

memberSchema.methods.isGroupAdmin = function(checkRole) {
    return checkRole === 'ADMIN';
};

memberSchema.methods.isInActivated = function(checkStatus) {
    return checkStatus === 'INACTIVE';
};

memberSchema.methods.isSuspended = function(checkStatus) {
    return checkStatus === 'SUSPENDED';
};

module.exports = mongoose.model('Member', memberSchema);
