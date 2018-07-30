var csrf = require('csurf');
var express = require('express');
var router = express.Router();

var csrfProtection = csrf();
router.use(csrfProtection);

var auth_controller = require('../controllers/backend/authController');

router.get('/', auth_controller.isLoggedIn, auth_controller.get_dashboard);

router.get('/logout', auth_controller.isLoggedIn, auth_controller.get_logout);

//Not login to /backoffice/*
router.use('/', auth_controller.notLogin_use);

router.get('/login', auth_controller.notLoggedIn, auth_controller.login_get);
router.post('/login', auth_controller.login_post);

module.exports = router;