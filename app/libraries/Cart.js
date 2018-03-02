var async = require('async');
var settings = require('../../app/config/settings');

exports.getVAT = function(money) {
    return parseInt(money) * parseInt(settings.vat) / 100;
};

exports.update_total_cart_amount = function(req, res) {
    req.session.vat = settings.vat;
    req.session.total_cart_amount = 0;
    async.each(req.session.cart, function(cart_product, callback) {
        req.session.total_cart_amount = req.session.total_cart_amount + cart_product.total_item_price;
        callback();
    });

    // under the free shipping threshold
    if (req.session.total_cart_amount < settings.free_shipping_amount) {
        req.session.total_cart_amount = req.session.total_cart_amount + settings.flat_shipping;
        req.session.shipping_cost_applied = true;
    } else {
        req.session.shipping_cost_applied = false;
    }
};