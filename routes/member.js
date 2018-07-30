var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var csrfProtection = csrf();
router.use(csrfProtection);

// Require Controller Module
var member_controller = require('../controllers/memberController');

/* GET Profile */
router.get('/tai-khoan', member_controller.isLoggedIn, member_controller.get_profile);

/* GET Logout */
router.get('/dang-thoat', member_controller.isLoggedIn, member_controller.get_logout);

router.use('/', member_controller.notLogin_use);

/* GET Member Regsiter. */
router.get('/dang-ky', member_controller.notLoggedIn, member_controller.get_regsiter);

/* POST Member Regsiter */
router.post('/dang-ky', member_controller.post_regsiter);

/* GET Member Login */
router.get('/dang-nhap', member_controller.notLoggedIn, member_controller.get_login);

/* GET Member Login */
router.post('/dang-nhap', member_controller.post_login);

/* GET Facebook Login */
router.get('/facebook', member_controller.get_facebook_login);

/* GET Facebook callback Login  */
router.get('/facebook/callback', member_controller.get_facebook_login_callback);

/* GET Google Login */
router.get('/google', member_controller.get_google_login);

/* GET Google callback Login  */
router.get('/google/callback', member_controller.get_google_login_callback);

module.exports = router;