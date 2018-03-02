var express = require('express');
var router = express.Router();

// Require controller modules
var product_controller = require('../controllers/frontend/productController');

router.get('/')

router.get('/:slug', product_controller.product_detail);

module.exports = router;