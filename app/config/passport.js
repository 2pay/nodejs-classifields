var validator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var settings = require('../config/settings');
var Customer = require('../models/customer');
var Backend = require('../models/backend');
var configAuth = require('./auth');

var provider = null;

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

//store user id in session
passport.deserializeUser(function(customerId, done) {

    if (provider === "backend") {
        Backend.findOne({ _id: { $eq: customerId } })
            .exec((err, user) => {
                if (user) {
                    var newUser = user.toObject();
                    if (provider != "backend") {
                        newUser['roles'] = "CUSTOMER";
                        newUser['provider'] = provider;
                    } else {
                        newUser['provider'] = provider;
                    }
                    done(err, newUser);
                } else {
                    done(err, null);
                }
            });
    } else {
        Customer.findOne({ _id: { $eq: customerId } })
            .exec((err, user) => {
                if (user) {
                    var newUser = user.toObject();
                    if (provider != "backend") {
                        newUser['roles'] = "CUSTOMER";
                        newUser['provider'] = provider;
                    } else {
                        newUser['provider'] = provider;
                    }
                    done(err, newUser);
                } else {
                    done(err, null);
                }
            });
    }
});

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('firstname', 'Vui lòng nhập họ của quý khách.').notEmpty();
    req.checkBody('lastname', 'Vui lòng nhập tên của quý khách.').notEmpty();
    req.checkBody('telephone', 'Vui lòng nhập số điện thoại của quý khách.').notEmpty();
    req.checkBody('address', 'Vui lòng nhập địa chỉ của quý khách.').notEmpty();
    req.checkBody('city_id', 'Vui lòng chọn tỉnh thành của quý khách.').notEmpty();
    req.checkBody('district_id', 'Vui lòng chọn quận huyện của quý khách.').notEmpty();
    req.checkBody('country_id', 'Vui lòng chọn quốc gia của quý khách.').notEmpty();
    req.checkBody('email', 'Địa chỉ Email không hợp lệ, vui lòng kiểm tra lại.').notEmpty().isEmail();
    req.checkBody('password', 'Mật khẩu không hợp lệ, phải ít nhất từ ' + settings.passwordLenght + ' ký tự trở lên, vui lòng kiểm tra lại.').notEmpty().isLength({
        min: settings.passwordLenght
    });
    req.checkBody('password', 'Xác nhận mật khẩu không giống nhau, vui lòng kiểm tra lại.').equals(req.body.confirmpassword);
    req.checkBody('agree', 'Bạn phải chấp thuận với những quy định và chính sách của chúng tôi để tiếp tục.').equals("1");
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Customer.findOne({
        'local.email': email
    }, function(err, customer) {
        if (err) {
            return done(err);
        }
        if (customer) {
            return done(null, false, {
                message: 'Địa chỉ Email này đã được sử dụng, vui lòng kiểm tra lại!'
            });
        } else {
            Customer.findOne({
                $or: [
                    { 'facebook.email': email },
                    { 'google.email': email }
                ]
            }).exec(function(err, customer) {
                if (err) {
                    return done(err);
                }

                if (customer) {
                    var wh = {};
                    if (customer.facebook.email) {
                        wh = { 'facebook.email': email }
                    } else if (customer.google.email) {
                        wh = { 'google.email': email }
                    } else {
                        return done(err);
                    }

                    Customer.findOneAndUpdate(wh, {
                        'info1.firstname': req.body.firstname,
                        'info1.lastname': req.body.lastname,
                        'info1.telephone': req.body.telephone,
                        'info1.fax': req.body.fax,
                        'info2.company': req.body.company,
                        'info2.address': req.body.address,
                        'info2.city_id': req.body.city_id,
                        'info2.district_id': req.body.district_id,
                        'info2.country_id': req.body.country_id,
                        'newsletter': req.body.newsletter,
                        'local.email': email,
                        'local.password': customer.encryptPassword(password)
                    }, {
                        new: true
                    }, function(err, customer) {
                        if (err) {
                            return done(err);
                        }
                        provider = "local";
                        return done(null, customer);
                    });

                } else {
                    // Add new Account
                    var newCustomer = new Customer();
                    newCustomer.info1.firstname = req.body.firstname;
                    newCustomer.info1.lastname = req.body.lastname;
                    newCustomer.info1.telephone = req.body.telephone;
                    newCustomer.info1.fax = req.body.fax;
                    newCustomer.info2.company = req.body.company;
                    newCustomer.info2.address = req.body.address;
                    newCustomer.info2.city_id = req.body.city_id;
                    newCustomer.info2.district_id = req.body.district_id;
                    newCustomer.info2.country_id = req.body.country_id;
                    newCustomer.newsletter = req.body.newsletter;
                    newCustomer.local.email = email;
                    newCustomer.local.password = newCustomer.encryptPassword(password);
                    newCustomer.roles = "CUSTOMER";
                    newCustomer.status = (settings.confirmEmail == 1) ? 'INACTIVE' : 'ACTIVE';

                    newCustomer.save(function(err, result) {
                        if (err) {
                            return done(err);
                        } else {
                            if (settings.confirmEmail == 1) {
                                return done(null, newCustomer);
                            } else {
                                req.logIn(newCustomer, function(err) {
                                    provider = "local";
                                    done(err, newCustomer);
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    req.checkBody('email', 'Địa chỉ Email không hợp lệ, vui lòng kiểm tra lại.').notEmpty().isEmail();
    req.checkBody('password', 'Mật khẩu không hợp lệ, vui lòng kiểm tra lại.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    //find user
    Customer.findOne({
        'local.email': email
    }, function(err, customer) {
        if (err) {
            return done(err);
        }

        if (!customer) {
            return done(null, false, {
                message: 'Tài khoản này không tồn tại, vui lòng kiểm tra lại.'
            });
        }
        if (!customer.validPassword(password)) {
            return done(null, false, {
                message: req.__('authen.invalid_password')
            });
        }
        if (customer.isInActivated(customer.status)) {
            return done(null, false, {
                message: 'Tài khoản của bạn chưa kích hoạt, vui lòng kích hoạt rồi đăng nhập lại.'
            });
        }
        if (customer.isSuspended(customer.status)) {
            return done(null, false, {
                message: 'Tài khoản của bạn hiện đang bị khóa, vui lòng kiểm tra lại.'
            });
        }
        provider = "local";
        return done(null, customer);
    });

}));

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: configAuth.facebookAuth.profileFields,
    passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {

    // Kiem tra neu ton tai thi dang nhap
    Customer.findOne({
        'facebook.id': profile.id
    }, function(err, customer) {
        if (err) {
            return done(err);
        }
        if (customer) {
            // Dang nhap tai khoan
            provider = "facebook";
            return done(null, customer);
        } else {

            Customer.findOne({
                $or: [
                    { 'local.email': profile.emails[0].value },
                    { 'google.email': profile.emails[0].value }
                ]
            }).exec(function(err, customer) {
                if (err) {
                    return done(err);
                }

                if (customer) {
                    var wh = {};
                    if (customer.local.email) {
                        wh = { 'local.email': profile.emails[0].value }
                    } else if (customer.google.email) {
                        wh = { 'google.email': profile.emails[0].value }
                    } else {
                        return done(err);
                    }

                    Customer.findOneAndUpdate(wh, {
                        'facebook.id': profile.id,
                        'facebook.token': token,
                        'facebook.name': profile.name.givenName + ' ' + profile.name.familyName,
                        'facebook.email': profile.emails[0].value,
                        'facebook.photo': 'https://graph.facebook.com/v2.8/' + profile.id + '/picture?type=large'
                    }, {
                        new: true
                    }, function(err, customer) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, customer);
                    });

                } else {
                    //Them tai khoan moi
                    var newCustomer = new Customer();
                    newCustomer.roles = "CUSTOMER";
                    newCustomer.facebook.id = profile.id;
                    newCustomer.facebook.token = token;
                    newCustomer.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newCustomer.facebook.email = profile.emails[0].value;
                    newCustomer.facebook.photo = 'https://graph.facebook.com/v2.8/' + profile.id + '/picture?type=large';
                    newCustomer.status = 'ACTIVE';
                    newCustomer.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, newCustomer);
                    });
                }
            });
        }
    });
}));

passport.use(new GoogleStrategy({

    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback: true

}, function(req, token, refreshToken, profile, done) {

    Customer.findOne({
        'google.id': profile.id
    }, function(err, customer) {
        if (err) {
            return done(err);
        }
        if (customer) {
            // Dang nhap tai khoan
            provider = "google";
            return done(null, customer);
        } else {

            Customer.findOne({
                $or: [
                    { 'local.email': profile.emails[0].value },
                    { 'facebook.email': profile.emails[0].value }
                ]
            }).exec(function(err, customer) {
                if (err) {
                    return done(err);
                }

                if (customer) {
                    var wh = {};
                    if (customer.local.email) {
                        wh = { 'local.email': profile.emails[0].value }
                    } else if (customer.facebook.email) {
                        wh = { 'facebook.email': profile.emails[0].value }
                    } else {
                        return done(err);
                    }

                    Customer.findOneAndUpdate(wh, {
                        'google.id': profile.id,
                        'google.token': token,
                        'google.name': profile.displayName,
                        'google.email': profile.emails[0].value,
                        'google.photo': profile.photos[0].value
                    }, {
                        new: true
                    }, function(err, customer) {
                        if (err) {
                            return done(err);
                        }
                        provider = "google";
                        return done(null, customer);
                    });

                } else {
                    //Them tai khoan moi
                    var newCustomer = new Customer();
                    newCustomer.roles = "CUSTOMER";
                    newCustomer.google.id = profile.id;
                    newCustomer.google.token = token;
                    newCustomer.google.name = profile.displayName;
                    newCustomer.google.email = profile.emails[0].value;
                    newCustomer.google.photo = profile.photos[0].value;
                    newCustomer.status = 'ACTIVE';
                    newCustomer.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        provider = "google";
                        return done(null, newCustomer);
                    });
                }
            });
        }
    });
}));

//Backend Login
passport.use('backend.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {

    req.checkBody('email', 'Địa chỉ Email không hợp lệ, vui lòng kiểm tra lại.').notEmpty().isEmail();
    req.checkBody('password', 'Mật khẩu không hợp lệ, vui lòng kiểm tra lại.').notEmpty();
    req.checkBody('pin_code', 'Mã PIN không hợp lệ, vui lòng kiểm tra lại.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    //find user
    Backend.findOne({
        'email': email
    }, function(err, backend) {
        if (err) {
            return done(err);
        }

        if (!backend) {
            return done(null, false, {
                message: 'Tài khoản này không tồn tại, vui lòng kiểm tra lại.'
            });
        }
        if (!backend.validPassword(password)) {
            return done(null, false, {
                message: 'Thông tin đăng nhập không chính xác, vui lòng kiểm tra lại.'
            });
        }
        if (!backend.validPincode(req.body.pin_code)) {
            return done(null, false, {
                message: 'Thông tin đăng nhập không chính xác, vui lòng kiểm tra lại.'
            });
        }
        if (!backend.isGroupAdmin(backend.roles)) {
            return done(null, false, {
                message: 'Bạn không có quyền truy cập vào khu vực này. <br />Vui lòng quay lại <a href="/"><span style="color: blue;">Trang chủ</span></a>.'
            });
        }
        if (backend.isInActivated(backend.status)) {
            return done(null, false, {
                message: 'Tài khoản của bạn chưa kích hoạt, vui lòng kích hoạt rồi đăng nhập lại.'
            });
        }
        if (backend.isSuspended(backend.status)) {
            return done(null, false, {
                message: 'Tài khoản của bạn hiện đang bị khóa, vui lòng kiểm tra lại.'
            });
        }

        // Update last IP
        // update last login
        Backend.findOneAndUpdate({
            'email': email
        }, {
            'lastIp': (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
            'lastLogin': new Date()
        }, {
            new: true
        }, function(err, backend) {
            if (err) {
                return done(err);
            }
            provider = "backend";
            return done(null, backend);
        });

    });

}));