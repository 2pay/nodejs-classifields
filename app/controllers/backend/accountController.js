var async = require('async');

//Require Settings
var settings = require('../../config/settings');

//Require Models
const Account = require('../../models/customer');
const Country = require('../../models/country');
const Province = require('../../models/provinces');
const District = require('../../models/districts');
const Ward = require('../../models/wards');

exports.get_dashboad = function(req, res, next) {
    res.render('backend/dashboad', {
        pagetitle: 'TrangTrang quản trị',
        layout: 'backend'
    });
}

exports.get_list_account = function(req, res, next) {
    async.parallel({

    }, function(err, results) {
        Account
            .$where({ 'roles': 'ADMIN' })
            .exec(function(err, adminlist) {
                if (err) {
                    throw err;
                } else {
                    es.render('backend/account/list', {
                        pagetitle: 'Danh sách tài khoản',
                        adminlist: adminlist,
                        layout: 'backend'
                    });
                }
            });
    });
}

exports.get_edit_account = function(req, res, next) {
    async.parallel({
        cities: function(callback) {
            City.find(callback);
        },
        countries: function(callback) {
            Country.find(callback);
        }
    }, function(err, results) {
        var id = req.params.id;
        Account.findById(id, function(err, account) {
            if (!account) {
                res.redirect('/backoffice');
            } else {

                // Mark our selected cities as checked
                for (i = 0; i < results.cities.length; i++) {
                    if (account.info2.cities.indexOf(results.cities[i]._id) > -1) {
                        //Current genre is selected. Set "checked" flag.
                        results.cities[i].checked = 'true';
                    }
                }

                // Mark our selected cities as checked
                for (i = 0; i < results.countries.length; i++) {
                    if (account.info2.countries.indexOf(results.countries[i]._id) > -1) {
                        //Current genre is selected. Set "checked" flag.
                        results.countries[i].checked = 'true';
                    }
                }

                res.render('backend/account/edit', {
                    pagetitle: 'Thông tin tài khoản',
                    csrfToken: req.csrfToken(),
                    cities_list: results.cities,
                    countries_list: results.countries,
                    account: account,
                    sessionFlash: res.locals.sessionFlash,
                    layout: 'backend'
                });
            }
        });
    });
}

exports.post_edit_account = function(req, res, next) {
    var id = req.params.id;
    Account.findById(id, function(err, account) {

        if (err) {
            req.session.sessionFlash = {
                type: 'error',
                message: 'Không tìm thấy thông tin tài khoản!'
            }
            res.redirect('/backoffice/account/edit/' + id);
        } else {

            var action = req.body.a;

            // Update Info
            if (action === 'info') {
                // Info 1
                account.info1.firstname = req.body.firstname;
                account.info1.lastname = req.body.lastname;
                account.info1.telephone = req.body.telephone;
                account.info1.fax = req.body.fax;
                account.newsletter = req.body.newsletter;

                // Info 2
                account.info2.company = req.body.company;
                account.info2.address = req.body.address;
                account.info2.countries = req.body.country;
                account.info2.cities = req.body.city;

                account.status = req.body.status;

                account.save(function(err, account) {
                    if (err) {
                        req.session.sessionFlash = {
                            type: 'error',
                            message: 'Lỗi cập nhật thông tin tài khoản!'
                        }
                        res.redirect('/backoffice/account/edit/' + id);
                    }
                    req.session.sessionFlash = {
                        type: 'success',
                        message: 'Thông tin tài khoản của bạn đã được cập nhật thành công!'
                    }
                    res.redirect('/backoffice/account/edit/' + id);
                });

            }

            // Update password
            if (action === 'password') {
                if (req.body.new_password == null || req.body.new_password == "") {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Mật khẩu không thể để trống, vui lòng nhập mật khẩu có độ dài từ ' + settings.passwordLenght + ' ký tự trở lên!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-2');
                } else if (req.body.new_password.length < settings.passwordLenght) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Mật khẩu phải có độ dài từ ' + settings.passwordLenght + ' ký tự trở lên, vui lòng kiểm tra lại!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-2');
                } else if (req.body.new_password != req.body.new_password2) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Xác nhận lại mật khẩu không chính xác, vui lòng kiểm tra lại!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-2');
                } else {
                    account.local.password = account.encryptPassword(req.body.new_password) || account.local.password;
                    account.save(function(err, account) {
                        if (err) {
                            req.session.sessionFlash = {
                                type: 'error',
                                message: 'Lỗi cập nhật tài khoản, vui lòng kiểm tra lại!'
                            }
                        }

                        req.session.sessionFlash = {
                            type: 'success',
                            message: 'Thông tin tài khoản của bạn đã được cập nhật!'
                        }

                        res.redirect('/backoffice/account/edit/' + id + '#tabs-2');
                    });
                }
            }

            // Update PIN code
            if (action === 'pincode') {

                if (req.body.newpin_code == null || req.body.newpin_code == "") {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Mã PIN không thể để trống, vui lòng nhập mật khẩu có độ dài từ ' + settings.passwordLenght + ' ký tự trở lên!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-3');
                } else if (req.body.newpin_code.length < settings.passwordLenght) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Mã PIN phải có độ dài từ ' + settings.passwordLenght + ' ký tự trở lên, vui lòng kiểm tra lại!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-3');
                } else if (req.body.newpin_code != req.body.newpin_code2) {
                    req.session.sessionFlash = {
                        type: 'error',
                        message: 'Xác nhận lại mã PIN không chính xác, vui lòng kiểm tra lại!'
                    }
                    res.redirect('/backoffice/account/edit/' + id + '#tabs-3');
                } else {
                    account.local.pincode = account.encryptPincode(req.body.newpin_code) || account.local.pincode;
                    account.save(function(err, account) {
                        if (err) {
                            req.session.sessionFlash = {
                                type: 'error',
                                message: 'Lỗi cập nhật tài khoản, vui lòng kiểm tra lại!'
                            }
                        } else {
                            req.session.sessionFlash = {
                                type: 'success',
                                message: 'Mã PIN của bạn đã được cập nhật thành công!'
                            }
                        }
                        res.redirect('/backoffice/account/edit/' + id + '#tabs-2');
                    });
                }
            }
        }
    });
}