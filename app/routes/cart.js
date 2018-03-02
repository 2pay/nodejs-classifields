const express = require('express');
const router = express.Router();

const cartController = require('../controllers/frontend/cartController');

router.post('/addtocart', cartController.addtocart);
router.get('/emptycart', cartController.emptycart);

module.exports = router;