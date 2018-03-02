var express = require('express');
var router = express.Router();

// Require controller modules
var home_controller = require('../controllers/frontend/homeController');

/* GET Lang Vietnamese */
router.get('/vi', home_controller.lang_vi);

/* GET Lang English */
router.get('/en', home_controller.lang_en);

/* GET home page. */
router.get('/', home_controller.index);

/* GET contact page. */
router.get('/lien-he', home_controller.contact_get);

/* POST contact page. */
router.post('/lien-he', home_controller.contact_post);

/* GET Error page */
router.get('/notfound', home_controller.get_notfound);

module.exports = router;