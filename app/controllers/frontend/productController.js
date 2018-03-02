const async = require('async');
const Product = require('../../models/product');
const Category = require('../../models/category');

const settings = require('../../config/settings');
const Common = require('../../libraries/Common');
const library_product = require('../../libraries/Product');

exports.product_detail = function(req, res, next) {
    const id = library_product.getIdUrl(req.url) || null;
    async.waterfall([
        function(callback) {
            Product.findOne({ _id: id }, function(err, product) {
                if (err) {
                    return callback(err);
                } else if (!product) {
                    return callback(req.__('Your products you want to display does not exist.'), null);
                } else {
                    callback(null, product);
                }
            });
        },
        function(product, callback) {
            if (product.sales > 0 && product.sales < product.price) {
                var tax_cal = parseInt(product.sales) * 10 / 100;
            } else {
                var tax_cal = product.price * 10 / 100;
            }

            var proObj = product.toObject();
            proObj['tax'] = tax_cal;
            callback(null, proObj);
        }
    ], function(err, data) {
        if (err) {
            req.session.sessionFlash = {
                isArray: false,
                type: 'error',
                messages: err
            }
            res.redirect('/notfound');
        } else {
            res.render('frontend/shop/product', {
                pagetitle: settings.site_name + "-" + data.name,
                product: data,
                thumbs: data.thumbs,
                layout: 'product'
            });
        }
    });
};

exports.product_list = function(req, res, next) {
    var query = Product.find({}, null, { limit: settings.best_sales_limit, sort: { 'updatedAt': -1 } });
    query.exec(function(err, docs) {
        res.render('frontend/home/index', {
            pagetitle: 'Trang chủ',
            bestsales: docs
        });
    });
};