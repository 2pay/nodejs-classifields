var express = require('express');
var swap = require('node-currency-swap');
var util = require('util');

var func = require('../config/functions');
var Product = require('../models/product');
var Category = require('../models/category');

router = express.Router();

swap.addProvider(new swap.providers.GoogleFinance({ timeout: 3000 }));

router.get('/currency', function(req, res, next) {

    var rate = swap.quoteSync({ currency: 'USD/VND' });

    var vndPrice = 560000;
    var usdPrice = vndPrice / rate[0].value;
    console.log("Tiền USD: " + func.formatUsd(usdPrice));
    console.log("Tiền VND: " + func.formatCurrency(vndPrice));
    console.log("Ngày giao dịch: " + rate[0].date);
    console.log("Tỷ giá theo: " + rate[0].provider);

    res.render('test/currency', {
        pagetitle: 'Multi Currency',
        listCurrency: util.inspect(swap.providers, { showHidden: false, depth: null })
    });
});

router.get('/products', [
    function(req, res, next) {
        Product.find({})
            .lean()
            .populate({ path: 'categories' })
            .exec(function(err, docs) {

                var options = {
                    path: 'categories',
                    model: 'Category'
                };

                if (err) return res.json(500);
                Product.populate(docs, options, function(err, products) {
                    req.products = products;
                    next();
                });
            });
    },
    function(req, res, next) {

        console.log(req.products);

        res.render("test/products", {
            "products": req.products
        });
    }
]);

module.exports = router