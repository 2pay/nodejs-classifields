var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var adminSchema = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    info: {
        firstname: String,
        lastname: String,
        phone: String
    },
    password: String,
    pincode: String,
    email: String,
    roles: String, //ADMIN, MOD
    status: String,
    lastIp: String,
    lastLogin: String
}, {
    timestamps: true
});

adminSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

adminSchema.methods.validPassword = function(password) {
    var admin = this;
    return bcrypt.compareSync(password, admin.password);
};

adminSchema.methods.encryptPincode = function(pincode) {
    return bcrypt.hashSync(pincode, bcrypt.genSaltSync(10), null);
};

adminSchema.methods.validPincode = function(pincode) {
    var admin = this;
    return bcrypt.compareSync(pincode, admin.pincode);
};

adminSchema.methods.isGroupAdmin = function(checkRole) {
    if (checkRole === "ADMIN") {
        return true;
    } else {
        return false;
    }
};

adminSchema.methods.isInActivated = function(checkStatus) {
    if (checkStatus === "Inactive") {
        return true;
    } else {
        return false;
    }
};

adminSchema.methods.isSuspended = function(checkStatus) {
    if (checkStatus === "Suspended") {
        return true;
    } else {
        return false;
    }
};

adminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Admin', adminSchema);