const async = require('async');

var settings = require('../../config/settings');
var Administrator = require('../../models/backend');

exports.get_administrator_list = function(req, res, next) {
    var page = req.query.page === undefined ? 1 : req.query.page;

    var query = {};
    var options = {
        page: page,
        limit: 25,
        sort: { createdAt: -1 }
    };

    Administrator.paginate(query, options, function(err, result) {
        if (err) {
            console.log("Lỗi truy xuất danh mục sản phẩm: " + err);
        }

        res.render('backend/administrators/list', {
            pagetitle: req.__('Manage Administrators'),
            openSearch: 'closed',
            csrfToken: req.csrfToken(),
            list: result.docs,
            totalAdnins: parseInt(result.total),
            currentPage: parseInt(result.page),
            nextPage: parseInt(result.page) + 1,
            prevPage: parseInt(result.page) - 1,
            totalPages: parseInt(result.pages),
            layout: 'backend'
        });

    });
};

exports.search_administrator_list = function(req, res, next) {
    var page = req.query.page === undefined ? 1 : req.query.page;
    var query = {};
    var action = req.body.do;

    if (action === "search") {
        var email = req.body.email;
        var status = req.body.status;
        if (email.trim() != '') {
            query = {'email': email};
        }else if (status.trim() != '') {
            query = {'status': status};
        }else {
            query = {};
        }
    }

    var options = {
        page: page,
        limit: 25,
        sort: { createdAt: -1 }
    };

    Administrator.paginate(query, options, function(err, result) {
        if (err) {
            console.log("Lỗi truy xuất danh mục sản phẩm: " + err);
        }
        console.log(JSON.stringify(query));
        res.render('backend/administrators/list', {
            pagetitle: req.__('Manage Administrators'),
            openSearch: 'Open',
            postData: query,
            csrfToken: req.csrfToken(),
            list: result.docs,
            totalAdnins: parseInt(result.total),
            currentPage: parseInt(result.page),
            nextPage: parseInt(result.page) + 1,
            prevPage: parseInt(result.page) - 1,
            totalPages: parseInt(result.pages),
            layout: 'backend'
        });

    });
};

exports.get_create_administrator = function(req, res, next) {
    async.parallel({

        administrators: function(callback) {
            Administrator.find(callback);
        }

    }, function(err, results) {

        if (err) {
            return next(err);
        }

        var messages = req.flash('error');
        res.render('backend/administrators/create', {
            pagetitle: req.__('Create a new administrator'),
            csrfToken: req.csrfToken(),
            messages: messages,
            hasErrors: messages.length > 0,
            administrators: results.administrators,
            layout: 'backend'
        });

    });

};

exports.post_create_administrator = function(req, res, next) {
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    console.log(ip);
    req.checkBody('firstname', 'First name can not be left blank').notEmpty();
    req.checkBody('lastname', 'Last Name can not be left blank').notEmpty();
    req.checkBody('email', 'Email is invalid or can not be left blank').notEmpty().isEmail();
    req.checkBody('password', 'Password can not be left blank').notEmpty();
    req.checkBody('pin', 'PIN must be 6 digits').notEmpty().isLength({
        min: 6,
        max: 6
    });

    //Trim and escape the name field.
    req.sanitize('firstname').escape().trim();
    req.sanitize('lastname').escape().trim();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        res.redirect('back');
    } else {
    
        // Data from form is valid.
        //Check if Administrator with same name already exists
        Administrator.findOne({ 'email': req.body.email })
            .exec(function(err, found_administrator) {
                if (err) { return next(err); }

                if (found_administrator) {
                    //Administrator exists
                    req.flash('error', req.__('This email is exist, please choice other email.'));
                } else {
                    var newAdministrator = new Administrator()
                    newAdministrator.info.firstname = req.body.firstname;
                    newAdministrator.info.lastname = req.body.lastname;
                    newAdministrator.info.phone = req.body.phone;
                    newAdministrator.email = req.body.email;
                    newAdministrator.password = newAdministrator.encryptPassword(req.body.password);
                    newAdministrator.pincode = newAdministrator.encryptPincode(req.body.pin);
                    newAdministrator.roles = req.body.roles;
                    newAdministrator.status = 'ACTIVE';
                    newAdministrator.lastIp = ip;
                    newAdministrator.lastLogin = new Date();

                    newAdministrator.save(function(err) {
                        if (err) { return next(err); }
                        //Administrator saved. Redirect to administrators list
                        res.redirect('/backoffice/administrators');
                    });

                }

            });
    }
};

exports.get_edit_administrator = function(req, res, next) {
    var id = req.params.id;
    Administrator.findById(id, function(err, admin) {
        if (!admin) {
            res.redirect('/backoffice/administrators');
        } else {
            res.render('backend/administrators/edit', {
                pagetitle: 'Thông tin tài khoản',
                csrfToken: req.csrfToken(),
                administrator: admin,
                sessionFlash: res.locals.sessionFlash,
                layout: 'backend'
            });
        }
    });
};

exports.post_edit_administrator = function(req, res, next) {
    var id = req.params.id;
    Administrator.findById(id, function(err, admin) {

        if (err) {
            req.session.sessionFlash = {
                type: 'error',
                message: 'Không tìm thấy thông tin tài khoản!'
            }
            res.redirect('/backoffice/administrators/edit/' + id);
        } else {

            var action = req.body.a;

            // Update Info
            if (action === 'info') {
                admin.info.firstname = req.body.firstname;
                admin.info.lastname = req.body.lastname;
                admin.info.phone = req.body.phone;
                admin.roles = req.body.roles;
                admin.status = req.body.status;

                admin.save(function(err, admin) {
                    if (err) {
                        req.session.sessionFlash = {
                            type: 'error',
                            message: req.__('Error update administrator info!')
                        }
                        res.redirect('/backoffice/administrators/edit/' + id);
                    }
                    req.session.sessionFlash = {
                        type: 'success',
                        message: req.__('Your info updated success!')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id);
                });

            }

            // Update password
            if (action === 'password') {
                if (req.body.new_password == null || req.body.new_password == "") {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('Password not empty, please input min password ' + settings.passwordLenght + ' string!')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-2');
                } else if (req.body.new_password.length < settings.passwordLenght) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('Passwords must be at least ' + settings.passwordLenght + ' characters or more.')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-2');
                } else if (req.body.new_password != req.body.new_password2) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('Confirm password is not the same!')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-2');
                } else {
                    admin.password = admin.encryptPassword(req.body.new_password) || admin.password;
                    admin.save(function(err, admin) {
                        if (err) {
                            req.session.sessionFlash = {
                                type: 'error',
                                message: req.__('Password update error, please check again!')
                            }
                        }

                        req.session.sessionFlash = {
                            type: 'success',
                            message: req.__('Your password updated success!')
                        }

                        res.redirect('/backoffice/administrators/edit/' + id + '#tabs-2');
                    });
                }
            }

            // Update PIN code
            if (action === 'pincode') {

                if (req.body.newpin_code == null || req.body.newpin_code == "") {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('PIN can not be empty, please enter a PIN of ' + settings.passwordLenght + ' characters or more')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-3');
                } else if (req.body.newpin_code.length < settings.passwordLenght) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('Please enter a PIN of ' + settings.passwordLenght + ' characters or more')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-3');
                } else if (req.body.newpin_code != req.body.newpin_code2) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: req.__('Confirm PIN is not the same!')
                    }
                    res.redirect('/backoffice/administrators/edit/' + id + '#tabs-3');
                } else {
                    admin.pincode = admin.encryptPincode(req.body.newpin_code) || admin.pincode;
                    admin.save(function(err, admin) {
                        if (err) {
                            req.session.sessionFlash = {
                                type: 'error',
                                message: req.__('PIN update error, please check again!')
                            }
                        } else {
                            req.session.sessionFlash = {
                                type: 'success',
                                message: req.__('Your PIN updated success!')
                            }
                        }
                        res.redirect('/backoffice/administrators/edit/' + id + '#tabs-3');
                    });
                }
            }
        }
    });
};

exports.get_delete_administrator = function(req, res, next) {
    var id = req.params.id;
    Administrator.findByIdAndRemove(id, function deleteAdministrator(err) {
        if (err) { return next(err); }
        req.session.sessionFlash = {
            type: 'success',
            message: req.__('The administrator account was deleted successfully.')
        }
        res.redirect('/backoffice/administrators');
    });
};
