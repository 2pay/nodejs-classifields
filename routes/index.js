var express = require('express');
var router = express.Router();

// Require Controllers Module
var home_controller = require('../controllers/homeController');

/* GET Language English */
router.get('/en', home_controller.lang_en);

/* GET Language Vietnamese */
router.get('/vi', home_controller.lang_vi);

/* GET home page. */
router.get('/', home_controller.index);

module.exports = router;