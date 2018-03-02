const library_cart = require('../../libraries/Cart');
const library_product = require('../../libraries/Product');
const Product = require('../../models/product');

const settings = require('../../config/settings');



exports.addtocart = function(req, res, next) {
    var _ = require('underscore');
    var product_quantity = req.body.product_quantity ? parseInt(req.body.product_quantity) : 1;

    // setup cart object if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = {};
    }

    Product.findOne({ _id: { $eq: req.body.product_id } }).exec(function(err, product) {
        if (product) {

            var product_price = 0;
            var vat = 0;
            if (settings.vat_applied) {
                if (product.sale < product.price) {
                    product_price = parseFloat(product.sales).toFixed(2);
                } else {
                    product_price = parseFloat(product.price).toFixed(2);
                }
            } else {
                if (product.sale < product.price) {
                    vat = parseInt(product.sales) * parseInt(settings.vat) / 100;
                    product_price = parseFloat(product.sales + vat).toFixed(2);
                } else {
                    product_price = parseFloat(product.price + vat).toFixed(2);
                }
            }

            // if exists we add to the existing value
            if (req.session.cart[req.body.product_id]) {
                req.session.cart[req.body.product_id]["quantity"] = req.session.cart[req.body.product_id]["quantity"] + product_quantity;
                req.session.cart[req.body.product_id]["total_item_price"] = product_price * req.session.cart[req.body.product_id]["quantity"];
            } else {
                // Doesnt exist so we add to the cart session
                req.session.cart_total_items = req.session.cart_total_items + product_quantity;
                // new product info
                var product_obj = {};
                product_obj.name = product.name;
                product_obj.thumb = product.thumbs[0].small;
                product_obj.quantity = product_quantity;
                product_obj.total_item_price = product_price * product_quantity;
                product_obj.link = library_product.buildUrl('san-pham', product.slug, product._id);

                // new product id
                var cart_obj = {};
                cart_obj[product._id] = product_obj;

                // merge into the current cart
                _.extend(req.session.cart, cart_obj);
            }

            // update total cart amount
            library_cart.update_total_cart_amount(req, res);

            // update how many products in the shopping cart
            req.session.cart_total_items = Object.keys(req.session.cart).length;

            res.status(200).json({ message: 'Cart successfully updated', "total_cart_items": Object.keys(req.session.cart).length });
        } else {
            res.status(400).json({ message: 'Error updating cart. Please try again.' });
        }
    });
    console.log(req.session.cart);
};

// Totally empty the cart
exports.emptycart = function(req, res, next) {
    delete req.session.cart;
    delete req.session.order_id;

    // update total cart amount
    library_cart.update_total_cart_amount(req, res);
    res.status(200).json({ message: 'Cart successfully emptied', "total_cart_items": 0 });
};