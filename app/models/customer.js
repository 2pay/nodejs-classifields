var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
    _id: { type: 'String', unique: true, default: function() { return new Date().getTime().toString(8) } },
    info1: {
        firstname: String,
        lastname: String,
        telephone: String,
        fax: String
    },
    info2: {
        company: String,
        address: String,
        cities: [{ type: Schema.ObjectId, ref: 'City' }],
        countries: [{ type: Schema.ObjectId, ref: 'Country' }]
    },
    newsletter: Boolean,
    roles: String, //ADMIN, CUSTOMER, VIP
    local: {
        email: {
            type: String
        },
        password: {
            type: String
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
        activeToken: {
            type: String
        },
        activeExpires: {
            type: Date
        },
        pincode: {
            type: String
        }
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
    status: String, //ACTIVE, INACTIVE, SUSPENDED
    last_login_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

customerSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

customerSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

customerSchema.methods.encryptPincode = function(pincode) {
    return bcrypt.hashSync(pincode, bcrypt.genSaltSync(10), null);
};

customerSchema.methods.validPincode = function(pincode) {
    var admin = this;
    if (admin.local.pincode != null) {
        return bcrypt.compareSync(pincode, admin.local.pincode);
    } else {
        return false;
    }
};

customerSchema.methods.isInActivated = function(checkStatus) {
    if (checkStatus === "Inactive") {
        return true;
    } else {
        return false;
    }
};

customerSchema.methods.isSuspended = function(checkStatus) {
    if (checkStatus === "Suspended") {
        return true;
    } else {
        return false;
    }
};

customerSchema.methods.isGroupVip = function(checkRole) {
    if (checkRole === "VIP") {
        return true;
    } else {
        return false;
    }
};

customerSchema.methods.isGroupAdmin = function(checkRole) {
    if (checkRole === "ADMIN") {
        return true;
    } else {
        return false;
    }
};

module.exports = mongoose.model('Customer', customerSchema);