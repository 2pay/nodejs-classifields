var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var i18n = require('i18n');

var settings = require('../../config/settings');
var mailer = require('../../config/mailer');
var Customer = require('../../models/customer');

// GET Dashboad
exports.get_dashboard = function(req, res, next) {
    res.render('frontend/customer/dashboad', {
        pagetitle: 'Tài khoản khách hàng',
        users: req.user
    });
};

// GET Logout
exports.get_logout = function(req, res, next) {
    req.logout();
    res.redirect('/');
};

// GET Use
exports.get_use = function(req, res, next) {
    next();
};

// GET Regsiter
exports.get_register = function(req, res, next) {
    var messages = req.flash('error');
    res.render('frontend/customer/register', {
        pagetitle: 'Khách hàng đăng ký',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
};

// POST Regsiter
exports.post_regsiter = passport.authenticate('local.register', {
    successRedirect: '/khach-hang/tai-khoan',
    failureRedirect: '/khach-hang/dang-ky',
    badRequestMessage: 'Vui lòng nhập những thông tin yêu cầu vào các mục bên dưới.',
    failureFlash: true
});

// GET Login
exports.get_login = function(req, res, next) {
    var messages = req.flash('error');
    res.render('frontend/customer/login', {
        pagetitle: 'Khách hàng đăng nhập',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        i18n: res
    });
};

// POST Login
exports.post_login = function(req, res, next) {
    passport.authenticate('local.login', function(err, user, info) {

        if (err) {
            req.flash('error', req.__(err));
            return next(err);
        }
        if (!user) {
            req.flash('error', req.__('authen.account_not_exist'));
            return res.redirect('/khach-hang/dang-nhap');
        }
        req.logIn(user, function(err) {
            if (err) {
                req.flash('error', req.__("login error"));
                return next(err);
            }
            return res.redirect('/khach-hang/tai-khoan');
        });
    })(req, res, next);
};

// GET Facebook login
exports.get_facebook_login = passport.authenticate('facebook', {
    scope: 'email'
});

// GET Facebook callback login
exports.get_facebook_callback_login = passport.authenticate('facebook', {
    successRedirect: '/khach-hang/tai-khoan',
    failureRedirect: '/khach-hang/dang-nhap'
});

// GET Google login
exports.get_google_login = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// GET Google callback login
exports.get_google_callback_login = passport.authenticate('google', {
    successRedirect: '/khach-hang/tai-khoan',
    failureRedirect: '/khach-hang/dang-nhap'
});

// GET Forgot password
exports.get_forgot_password = function(req, res, next) {
    var messages = req.flash('error');
    var messagesSuccess = req.flash('success');
    res.render('frontend/customer/forgotpassword', {
        pagetitle: 'Khôi phục mật khẩu',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        messagesSuccess: messagesSuccess,
        hasSuccess: messagesSuccess.length > 0
    });
};

// POST Forgot password
exports.post_forgot_password = function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            Customer.findOne({ 'local.email': req.body.email }, function(err, customer) {
                if (!customer) {
                    req.flash('error', 'Tài khoản của bạn không tồn tại, vui lòng kiểm tra lại.');
                    return res.redirect('/khach-hang/quen-mat-khau');
                }

                customer.local.resetPasswordToken = token;
                customer.local.resetPasswordExpires = Date.now() + 3600000 * 24; // 24 hour

                customer.save(function(err) {
                    done(err, token, customer);
                });
            });
        },
        function(token, customer, done) {

            mailer.sendMail({
                from: settings.site_name + " " + settings.mailOptions.auth.user,
                to: customer.local.email,
                subject: 'Khôi phục mật khẩu',
                template: 'password_reset',
                context: {
                    settings: settings,
                    hostUrl: req.headers.host,
                    deviceType: req.device.type,
                    customeName: customer.info1.firstname + ' ' + customer.info1.lastname,
                    resetUrl: req.headers.host + '/khach-hang/phuc-hoi-mat-khau/' + token,
                    resetCode: token
                }
            }, function(err, response) {
                if (err) {
                    req.flash('error', 'Hiện tại hệ thống ' + settings.site_name + ' không thể thực hiện chức năng gửi thư, vui lòng liên hệ với chúng tôi để được hỗ trợ.');
                }
                req.flash('success', 'Một e-mail khôi phục mật khẩu đã được gửi đến địa chỉ ' + customer.local.email + ' cùng với các bước khôi phục mật khẩu của bạn.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/khach-hang/quen-mat-khau');
    });
};

// GET forgot password token
exports.get_forgot_password_token = function(req, res, next) {
    var ressetmessages = req.flash('error');
    var ressetSuccess = req.flash('success');
    Customer.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, customer) {
        if (!customer) {
            req.flash('error', 'Mã khôi phục mật khẩu không hợp lệ hoặc đã quá hạn, vui lòng thực hiện lại.');
            return res.redirect('/khach-hang/quen-mat-khau');
        }
        res.render('frontend/customer/resetpassword', {
            pagetitle: 'Khôi phục mật khẩu',
            csrfToken: req.csrfToken(),
            ressetmessages: ressetmessages,
            hasErrors: ressetmessages.length > 0,
            ressetSuccess: ressetSuccess,
            hasSuccess: ressetSuccess.length > 0,
            customer: req.user
        });
    });
};

// POST Forgot password token
exports.post_forgot_password_token = function(req, res, next) {
    var provider = null;
    async.waterfall([
        function(done) {

            req.checkBody('password', 'Mật khẩu không hợp lệ, phải ít nhất từ ' + settings.passwordLenght + ' ký tự trở lên, vui lòng kiểm tra lại.').notEmpty().isLength({
                min: settings.passwordLenght
            });
            req.checkBody('password', 'Xác nhận mật khẩu không giống nhau, vui lòng kiểm tra lại.').equals(req.body.confirmpassword);

            var errors = req.validationErrors();
            if (errors) {
                var messages = [];
                errors.forEach(function(error) {
                    messages.push(error.msg);
                });
                return done(null, false, req.flash('error', messages));
            }

            Customer.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, customer) {
                if (!customer) {
                    req.flash('error', 'Mã khôi phục mật khẩu không hợp lệ hoặc đã quá hạn, vui lòng thực hiện lại.');
                    return res.redirect('back');
                }

                customer.local.password = customer.encryptPassword(req.body.password);
                customer.local.resetPasswordToken = undefined;
                customer.local.resetPasswordExpires = undefined;

                customer.save(function(err) {
                    if (err) {
                        return done(err);
                    }
                    req.logIn(customer, function(err) {
                        provider = "local";
                        done(err, customer);
                    });
                });
            });
        },
        function(customer, done) {
            if (customer) {
                var successMail = {
                    from: settings.site_name + ' ' + settings.mailOptions.auth.user,
                    to: customer.local.email,
                    subject: 'Mật khẩu của bạn đã được thay đổi',
                    text: 'Chào, ' + customer.info1.firstname + ' ' + customer.info1.lastname + '\n\n' +
                        'Đây là e-mail xác nhận mật khẩu của bạn đã thay đổi thành công cho tài khoản ' + customer.local.email + '.\n'
                };
                mailer.sendMail(successMail, function(err) {
                    req.flash('success', 'Mật khẩu của bạn đã thay đổi thành công.');
                    done(err);
                });
            } else {
                return res.redirect('back');
            }
        }
    ], function(err) {
        res.redirect('/');
    });

};

// Is Logged
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Is not logged
exports.notLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/khach-hang/tai-khoan');
}

// Provider Mailler
exports.providerMailer = function() {
    var mailArr = settings.smtp_providers;

    var tmp = mailArr.slice(mailArr);
    var ret = [];

    for (var i = 0; i < 1; i++) {
        var index = Math.floor(Math.random() * tmp.length);
        var removed = tmp.splice(index, 1);
        ret.push(removed[0]);
    }

    return ret[0];
}