var passport = require('passport');
var body = require('express-validator').body;
var validationResult = require('express-validator').validationResult;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var settings = require('../config/settings');
var Member = require('../models/member');
var cfgAuth = require('./auth');

function attachProvider(user, provider) {
    if (user) {
        user.provider = provider;
    }

    return user;
}

function getSessionUser(sessionUser) {
    if (typeof sessionUser === 'object' && sessionUser !== null) {
        return sessionUser;
    }

    return {
        id: sessionUser,
        provider: 'local'
    };
}

async function runValidations(req, validations) {
    await Promise.all(validations.map(function(validation) {
        return validation.run(req);
    }));

    return validationResult(req);
}

function flashValidationErrors(req, result) {
    var messages = result.array().map(function(error) {
        return error.msg;
    });

    messages.forEach(function(message) {
        req.flash('error', message);
    });

    return messages.length > 0;
}

function getProfileEmail(profile) {
    if (!profile || !Array.isArray(profile.emails) || !profile.emails[0]) {
        return null;
    }

    return profile.emails[0].value.toLowerCase();
}

function getProfilePhoto(profile) {
    if (!profile || !Array.isArray(profile.photos) || !profile.photos[0]) {
        return null;
    }

    return profile.photos[0].value;
}

function getFacebookName(profile) {
    if (profile.displayName) {
        return profile.displayName;
    }

    var firstName = profile._json && profile._json.first_name ? profile._json.first_name : '';
    var lastName = profile._json && profile._json.last_name ? profile._json.last_name : '';

    return (firstName + ' ' + lastName).trim();
}

function buildFacebookPayload(profile, token) {
    var email = getProfileEmail(profile);
    var photo = getProfilePhoto(profile) || ('https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large');

    return {
        'facebook.id': profile.id,
        'facebook.token': token,
        'facebook.email': email,
        'facebook.name': getFacebookName(profile),
        'facebook.photo': photo
    };
}

function buildGooglePayload(profile, token) {
    return {
        'google.id': profile.id,
        'google.token': token,
        'google.name': profile.displayName,
        'google.email': getProfileEmail(profile),
        'google.photo': getProfilePhoto(profile)
    };
}

passport.serializeUser(function(user, done) {
    done(null, {
        id: user._id.toString(),
        provider: user.provider || 'local'
    });
});

passport.deserializeUser(function(sessionUser, done) {
    (async function() {
        var currentUser = getSessionUser(sessionUser);
        var member = await Member.findById(currentUser.id).lean();

        if (!member) {
            return done(null, false);
        }

        member.provider = currentUser.provider || 'local';
        return done(null, member);
    })().catch(function(err) {
        done(err);
    });
});

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    (async function() {
        var result = await runValidations(req, [
            body('firstname')
                .trim()
                .notEmpty()
                .withMessage(req.__('Please input first name.')),
            body('lastname')
                .trim()
                .notEmpty()
                .withMessage(req.__('Please input last name.')),
            body('email')
                .trim()
                .notEmpty()
                .withMessage(req.__('Email address invalid, please check again.'))
                .bail()
                .isEmail()
                .withMessage(req.__('Email address invalid, please check again.'))
                .bail()
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage(req.__('Password invalid, password must be at least %d characters or more', settings.passwordLength))
                .bail()
                .isLength({ min: settings.passwordLength })
                .withMessage(req.__('Password invalid, password must be at least %d characters or more', settings.passwordLength)),
            body('confirmpassword')
                .custom(function(value, meta) {
                    return value === meta.req.body.password;
                })
                .withMessage(req.__('Confirm password is not the same, please check again.')),
            body('accept')
                .equals('1')
                .withMessage(req.__('You have to accept with our terms to continute.'))
        ]);

        if (!result.isEmpty()) {
            flashValidationErrors(req, result);
            return done(null, false);
        }

        var normalizedEmail = req.body.email;

        var member = await Member.findOne({
            'local.email': normalizedEmail
        });

        if (member) {
            return done(null, false, {
                message: req.__('Email address used, please enter another email.')
            });
        }

        var newMember = new Member({
            info: {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            },
            local: {
                email: normalizedEmail
            },
            newsletter: req.body.newsletter === '1',
            roles: 'MEMBER',
            status: settings.confirmRegister == 1 ? 'INACTIVE' : 'ACTIVE'
        });

        newMember.local.password = newMember.encryptPassword(password);
        await newMember.save();

        return done(null, attachProvider(newMember, 'local'));
    })().catch(function(err) {
        done(err);
    });
}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    (async function() {
        var result = await runValidations(req, [
            body('email')
                .trim()
                .notEmpty()
                .withMessage(req.__('Invalid email address, please try again.'))
                .bail()
                .isEmail()
                .withMessage(req.__('Invalid email address, please try again.'))
                .bail()
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage(req.__('Incorrect password, please try again.'))
        ]);

        if (!result.isEmpty()) {
            flashValidationErrors(req, result);
            return done(null, false);
        }

        var normalizedEmail = req.body.email;

        var member = await Member.findOne({
            'local.email': normalizedEmail
        });

        if (!member) {
            return done(null, false, {
                message: req.__('Member not found!')
            });
        }

        if (!member.validPassword(password)) {
            return done(null, false, {
                message: req.__('Password incorrect, please try again.')
            });
        }

        if (member.isInActivated(member.status)) {
            return done(null, false, {
                message: req.__('Your account is Inactive')
            });
        }

        if (member.isSuspended(member.status)) {
            return done(null, false, {
                message: req.__('Your account is Suspended')
            });
        }

        return done(null, attachProvider(member, 'local'));
    })().catch(function(err) {
        done(err);
    });
}));

passport.use(new FacebookStrategy({
    clientID: cfgAuth.facebookAuth.clientID,
    clientSecret: cfgAuth.facebookAuth.clientSecret,
    callbackURL: cfgAuth.facebookAuth.callbackURL,
    profileFields: cfgAuth.facebookAuth.profileFields,
    passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {
    (async function() {
        var member = await Member.findOne({
            'facebook.id': profile.id
        });

        if (member) {
            return done(null, attachProvider(member, 'facebook'));
        }

        var email = getProfileEmail(profile);
        var payload = buildFacebookPayload(profile, token);

        if (email) {
            member = await Member.findOneAndUpdate({
                'local.email': email
            }, {
                $set: payload
            }, {
                new: true
            });

            if (member) {
                return done(null, attachProvider(member, 'facebook'));
            }

            member = await Member.findOneAndUpdate({
                'google.email': email
            }, {
                $set: payload
            }, {
                new: true
            });

            if (member) {
                return done(null, attachProvider(member, 'facebook'));
            }
        }

        var newMember = new Member({
            facebook: {
                id: profile.id,
                token: token,
                email: email,
                name: payload['facebook.name'],
                photo: payload['facebook.photo']
            },
            roles: 'MEMBER',
            status: 'ACTIVE'
        });

        await newMember.save();
        return done(null, attachProvider(newMember, 'facebook'));
    })().catch(function(err) {
        done(err);
    });
}));

passport.use(new GoogleStrategy({
    clientID: cfgAuth.googleAuth.clientID,
    clientSecret: cfgAuth.googleAuth.clientSecret,
    callbackURL: cfgAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function(req, token, refreshToken, profile, done) {
    (async function() {
        var member = await Member.findOne({
            'google.id': profile.id
        });

        if (member) {
            return done(null, attachProvider(member, 'google'));
        }

        var email = getProfileEmail(profile);
        var payload = buildGooglePayload(profile, token);

        if (email) {
            member = await Member.findOneAndUpdate({
                'local.email': email
            }, {
                $set: payload
            }, {
                new: true
            });

            if (member) {
                return done(null, attachProvider(member, 'google'));
            }

            member = await Member.findOneAndUpdate({
                'facebook.email': email
            }, {
                $set: payload
            }, {
                new: true
            });

            if (member) {
                return done(null, attachProvider(member, 'google'));
            }
        }

        var newMember = new Member({
            google: {
                id: profile.id,
                token: token,
                name: profile.displayName,
                email: email,
                photo: payload['google.photo']
            },
            roles: 'MEMBER',
            status: 'ACTIVE'
        });

        await newMember.save();
        return done(null, attachProvider(newMember, 'google'));
    })().catch(function(err) {
        done(err);
    });
}));

passport.use('backend.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    (async function() {
        var result = await runValidations(req, [
            body('email')
                .trim()
                .notEmpty()
                .withMessage(req.__('Email address is invalid, please check again'))
                .bail()
                .isEmail()
                .withMessage(req.__('Email address is invalid, please check again'))
                .bail()
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage(req.__('Please input your password')),
            body('pin_code')
                .notEmpty()
                .withMessage(req.__('Please input your pincode'))
        ]);

        if (!result.isEmpty()) {
            flashValidationErrors(req, result);
            return done(null, false);
        }

        var normalizedEmail = req.body.email;

        var member = await Member.findOne({
            'local.email': normalizedEmail
        });

        if (!member) {
            return done(null, false, {
                message: req.__('This account not exist, please check again.')
            });
        }

        if (!member.validPassword(password)) {
            return done(null, false, {
                message: req.__('Your password invalid, please reinput.')
            });
        }

        if (!member.validPincode(req.body.pin_code)) {
            return done(null, false, {
                message: req.__('Your pin code invalid, please reinput.')
            });
        }

        if (!member.isGroupAdmin(member.roles)) {
            return done(null, false, {
                message: req.__('You haven\'t permission login to administrator panel, please goback home page.')
            });
        }

        if (member.isInActivated(member.status)) {
            return done(null, false, {
                message: req.__('Your account not activated.')
            });
        }

        if (member.isSuspended(member.status)) {
            return done(null, false, {
                message: req.__('Your account is locked.')
            });
        }

        return done(null, attachProvider(member, 'backend'));
    })().catch(function(err) {
        done(err);
    });
}));
