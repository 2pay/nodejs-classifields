var passport = require('passport');

exports.get_register = function(req, res, next) {
    var messages = req.flash('error');
    res.render('frontend/member/register', {
        pageTitle: req.__('Member Register'),
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
};

// POST Register
exports.post_register = passport.authenticate('local.register', {
    successRedirect: '/member/dashboard',
    failureRedirect: '/member/register',
    failureFlash: true
});

// GET Dashboard
exports.get_dashboard = function(req, res, next) {
    res.render('frontend/member/dashboard', {
        pageTitle: req.__('Dashboard')
    });
};

// GET Login
exports.get_login = function(req, res, next) {
    var messages = req.flash('error');
    res.render('frontend/member/login', {
        pageTitle: req.__('Member Login'),
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
};

exports.get_logout = function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }

        res.redirect('/');
    });
};

// GET Login
exports.post_login = passport.authenticate('local.login', {
    successRedirect: '/member/dashboard',
    failureRedirect: '/member/login',
    failureFlash: true
});

// GET Facebook login
exports.get_facebook_login = passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
});

// GET Facebook login
exports.get_facebook_login_callback = passport.authenticate('facebook', {
    successRedirect: '/member/dashboard',
    failureRedirect: '/member/login'
});

// GET Google login
exports.get_google_login = passport.authenticate('google', {
    scope: ['email', 'profile']
});

// GET Google login
exports.get_google_login_callback = passport.authenticate('google', {
    successRedirect: '/member/dashboard',
    failureRedirect: '/member/login'
});

exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/member/login');
};

exports.notLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/member/dashboard');
};

exports.notLogin_use = function(req, res, next) {
    next();
};
