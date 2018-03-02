var csrf = require('csurf');
var express = require('express');
var router = express.Router();

var csrfProtection = csrf({ cookie: true });
router.use(csrfProtection);

// Require controller
var admin_controller = require('../controllers/backend/adminController');
var auth_controller = require('../controllers/backend/authController');
var account_controller = require('../controllers/backend/accountController');
var category_controller = require('../controllers/backend/categoryController');
var product_controller = require('../controllers/backend/productController');

// GET Backend home.
router.get('/', auth_controller.isLoggedIn, account_controller.get_dashboad);

// ==========================================================================
// ADMINISTRATOR ACCOUNT
// ==========================================================================
router.get('/administrators', auth_controller.isLoggedIn, admin_controller.get_administrator_list);
router.post('/administrators/search', auth_controller.isLoggedIn, admin_controller.search_administrator_list);
router.get('/administrators/create', auth_controller.isLoggedIn, admin_controller.get_create_administrator);
router.post('/administrators/create', auth_controller.isLoggedIn, admin_controller.post_create_administrator);
router.get('/administrators/edit/:id', auth_controller.isLoggedIn, admin_controller.get_edit_administrator);
router.post('/administrators/edit/:id', auth_controller.isLoggedIn, admin_controller.post_edit_administrator);
router.get('/administrators/delete/:id', auth_controller.isLoggedIn, admin_controller.get_delete_administrator);

// ==========================================================================
// PRODUCT MODULE
// ==========================================================================
router.get('/products', auth_controller.isLoggedIn, product_controller.get_products_list);
router.get('/products/add-product', product_controller.get_add_product);
router.post('/products/add-product', product_controller.productUpload, product_controller.post_add_product);
router.get('/products/edit/:id', auth_controller.isLoggedIn, product_controller.get_edit_product);
router.put('/products/:id', auth_controller.isLoggedIn, product_controller.put_edit_product);

// ==========================================================================
// CATEGORY MODULE
// ==========================================================================
router.get('/categories/test/:id', auth_controller.isLoggedIn, category_controller.test);
router.get('/categories', auth_controller.isLoggedIn, category_controller.get_categories_list);
router.get('/categories/add/:id', auth_controller.isLoggedIn, category_controller.get_add_category);
router.get('/categories/add', auth_controller.isLoggedIn, category_controller.get_add_category);
router.post('/categories/add', auth_controller.isLoggedIn, category_controller.post_add_category);
router.get('/categories/edit/:id', auth_controller.isLoggedIn, category_controller.get_edit_category);
router.post('/categories/edit/:id', auth_controller.isLoggedIn, category_controller.post_edit_category);
router.get('/categories/delete/:id', auth_controller.isLoggedIn, category_controller.get_delete_category);

// ==========================================================================
// ACCOUNT MODULE
// ==========================================================================
router.get('/account/list', auth_controller.isLoggedIn, account_controller.get_list_account);
router.get('/account/edit/:id', auth_controller.isLoggedIn, auth_controller.isLoggedIn, account_controller.get_edit_account);
router.post('/account/edit/:id', auth_controller.isLoggedIn, account_controller.post_edit_account);
router.get('/logout', auth_controller.isLoggedIn, auth_controller.logout_get);
router.use('/', auth_controller.notLoggedIn, auth_controller.notlogin_use);
router.get('/login', auth_controller.login_get);
router.post('/login', auth_controller.login_post);

module.exports = router;