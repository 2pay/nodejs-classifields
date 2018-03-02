var express = require('express');
router = express.Router();

// Require controller modules
var apiController = require('../../../controllers/api/v1/apiController');

router.get('/', apiController.get_home);

router.get('/page-districts-by-province', apiController.get_page_districts_by_province);
router.get('/districts-by-province/:id_province', apiController.api_districts_by_province);

router.get('/page-district-by-id', apiController.get_page_district_by_id);
router.get('/district-by-id/:id_district', apiController.api_district_by_id);

module.exports = router;