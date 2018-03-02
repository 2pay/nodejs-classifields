var async = require('async');
var passport = require('passport');

//Require Settings
var settings = require('../../config/settings');

exports.login_get = function(req, res, next) {
    var messages = req.flash('error');
    res.render('backend/' + settings.adminLoginTemplate, {
        pagetitle: 'Quản trị viên đăng nhập',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        layout: false
    });
}

exports.login_post = passport.authenticate('backend.login', {
    successRedirect: '/backoffice',
    failureRedirect: '/backoffice/login',
    badRequestMessage: 'Vui lòng nhập những thông tin yêu cầu vào các mục bên dưới.',
    failureFlash: true
});

exports.logout_get = function(req, res, next) {
    req.logout();
    res.redirect('/backoffice/login');
}

exports.notlogin_use = function(req, res, next) {
    next();
}

exports.isLoggedIn = function(req, res, next) {
    if (req.user && req.user.roles === "ADMIN" && req.user.provider === "backend") {
        return next();
    } else {
        return res.redirect('/backoffice/login');
    }
}

exports.notLoggedIn = function(req, res, next) {
    if (!req.user) {
        return next();
    } else {
        if (req.user.roles !== "ADMIN" || req.user.provider !== "backend") {
            return next();
        } else {
            return res.redirect('/backoffice');
        }
    }
}