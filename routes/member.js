var express = require('express');
var router = express.Router();
var csrf = require('@dr.pogodin/csurf');

var csrfProtection = csrf();
router.use(csrfProtection);

// Require Controller Module
var member_controller = require('../controllers/memberController');

/* GET Member Dashboard */
router.get('/dashboard', member_controller.isLoggedIn, member_controller.get_dashboard);

/* GET Logout */
router.get('/logout', member_controller.isLoggedIn, member_controller.get_logout);

router.use('/', member_controller.notLogin_use);

/* GET Member Register. */
router.get('/register', member_controller.notLoggedIn, member_controller.get_register);

/* POST Member Register */
router.post('/register', member_controller.post_register);

/* GET Member Login */
router.get('/login', member_controller.notLoggedIn, member_controller.get_login);

/* POST Member Login */
router.post('/login', member_controller.post_login);

/* GET Facebook Login */
router.get('/facebook', member_controller.get_facebook_login);

/* GET Facebook callback Login  */
router.get('/facebook/callback', member_controller.get_facebook_login_callback);

/* GET Google Login */
router.get('/google', member_controller.get_google_login);

/* GET Google callback Login  */
router.get('/google/callback', member_controller.get_google_login_callback);

module.exports = router;
