const async = require('async');
const Product = require('../../models/product');
const Category = require('../../models/category');

const settings = require('../../config/settings');

exports.lang_vi = function(req, res, next) {
    res.cookie('language', 'vi', { maxAge: 900000, httpOnly: true });
    res.redirect('back');
};

exports.lang_en = function(req, res, next) {
    res.cookie('language', 'en', { maxAge: 900000, httpOnly: true });
    res.redirect('back');
};

exports.index = function(req, res, next) {
    async.parallel({
        bestsales: function(callback) {
            Product.find({}, null, { limit: settings.best_sales_limit, sort: { 'updatedAt': -1 } })
                .exec(function(err, bestsales) {
                    if (err) {
                        return callback(err);
                    } else if (bestsales) {
                        callback(null, bestsales);
                    }
                });
        }
    }, function(err, homeData) {
        res.render('frontend/home/index', {
            pagetitle: 'Trang chủ',
            bestsales: homeData.bestsales,
            i18n: res
        });
    });
};

exports.contact_get = function(req, res, next) {
    res.render('frontend/home/contact-us', {
        pagetitle: 'Liên hệ với chúng tôi'
    });
};

exports.contact_post = function(req, res, next) {
    res.send('Send contact is submited!');
};

exports.get_notfound = function(req, res, next) {
    res.render('frontend/home/notfound', {
        pagetitle: 'Not found'
    });
};