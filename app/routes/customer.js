var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var settings = require('../config/settings');

// Require member controller module
var customer_controller = require('../controllers/frontend/customerController');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/tai-khoan', customer_controller.isLoggedIn, customer_controller.get_dashboard);

router.get('/dang-thoat', customer_controller.isLoggedIn, customer_controller.get_logout);

router.use('/', customer_controller.notLoggedIn, customer_controller.get_use);

router.get('/dang-ky', customer_controller.notLoggedIn, customer_controller.get_register);

router.post('/dang-ky', customer_controller.post_regsiter);

router.get('/dang-nhap', customer_controller.notLoggedIn, customer_controller.get_login);

router.post('/dang-nhap', customer_controller.post_login);

router.get('/facebook', customer_controller.get_facebook_login);

router.get('/facebook/callback', customer_controller.get_facebook_callback_login);

router.get('/google', customer_controller.get_google_login);

router.get('/google/callback', customer_controller.get_google_callback_login);

router.get('/quen-mat-khau', customer_controller.notLoggedIn, customer_controller.get_forgot_password);

//http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/

router.post('/quen-mat-khau', customer_controller.post_forgot_password);

router.get('/phuc-hoi-mat-khau/:token', customer_controller.notLoggedIn, customer_controller.get_forgot_password_token);

router.post('/phuc-hoi-mat-khau/:token', customer_controller.post_forgot_password_token);

module.exports = router;