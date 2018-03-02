const path = require('path');
const multer = require('multer');
const async = require('async');

//Require Settings
const settings = require('../../config/settings');
const Common = require('../../libraries/Common');
const Resize = require('../../libraries/Resize');

// Require Libraries
const libraries_category = require('../../libraries/Category');

//Require Models
const Category = require('../../models/category');
const Product = require('../../models/product');

/* =======================================
List products
========================================*/
exports.get_products_list = function(req, res, next) {
    var page = req.query.page === undefined ? 1 : req.query.page;
    var query = {};
    var options = {
        page: page,
        limit: 5,
        sort: {
            created_at: 'desc'
        }
    };

    Product.paginate(query, options, function(err, result) {
        if (err) {
            console.log("Lỗi truy xuất sản phẩm: " + err);
        }
        var rt = [];
        for (let i = 0; i <= result.docs.length - 1; i++) {
            var priceRange = result.docs[i];
            //console.log(JSON.stringify(priceRange.price_range));
            rt.push(priceRange.price_range[0][i]);
        }
        console.log(JSON.stringify(rt));

        res.render('backend/products/list', {
            pagetitle: 'Danh mục sản phẩm',
            products: result.docs,
            totalProduct: result.total,
            currentPage: parseInt(result.page),
            totalPages: parseInt(result.pages),
            layout: 'backend'
        });

    });
}

/* =======================================
Add new product
========================================*/
exports.get_add_product = function(req, res, next) {

    async.parallel({
        categories: function(callback) {
            libraries_category.parentCategory(callback);
        },
        childs: function(callback) {
            libraries_category.subCategory(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('backend/products/add', {
            pagetitle: 'Thêm sản phẩm mới',
            csrfToken: req.csrfToken(),
            categories: results.categories,
            childs: results.childs,
            layout: 'backend'
        });
    });
};

exports.productUpload = multer({
    limits: { fileSize: settings.maxSizeUpload },
    fileFilter: function(req, file, cb) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb('Bạn chỉ có thể tải lên tệp tin hình ảnh có phần mở rộng là: ' + settings.allowUploadProductExt, false);
        }
    }
}).array('txtThumb', settings.maxFilesUpload);

exports.post_add_product = function(req, res, next) {
    req.session.addProductForm = req.body;

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.session.sessionFlash = {
            isArray: true,
            type: 'error',
            messages: messages
        }
        res.redirect('back');
    } else {
        if (req.files.length === 0) {
            req.session.sessionFlash = {
                isArray: false,
                type: 'error',
                messages: 'Bạn phải chọn ít nhất từ 1 - ' + settings.maxFilesUpload + ' hình ảnh của sản phẩm.'
            }
            res.redirect('back');
        } else {
            var user_id = '26022656612347';
            var inputCategory = req.body.category;
            var thumbs = [];

            Resize.productThumb(req.files).then((getThumbs) => {
                getThumbs.forEach(function(mediaData) {
                    thumbs.push({
                        small: mediaData[2].small,
                        medium: mediaData[1].medium,
                        large: mediaData[0].large
                    });
                });

                // create price range
                inputPriceRange = req.body.txtPriceRange;
                var obItemRange = {};
                var arItemRange = [];
                while (inputPriceRange.length) {
                    var prs = inputPriceRange.splice(0, 3);
                    obItemRange = {
                        cost: parseInt(prs[0]),
                        from: parseInt(prs[1]),
                        to: parseInt(prs[2])
                    };
                    arItemRange.push(obItemRange);
                }

                var newProduct = new Product({
                    poster: user_id,
                    categories: inputCategory,
                    name: req.body.txtName,
                    thumbs: thumbs,
                    slug: Common.transString(req.body.txtName),
                    desc: req.body.txtDesc,
                    price_range: arItemRange,
                    sku: req.body.txtSku,
                    status: req.body.txtStatus
                });

                Product.findOne({ slug: Common.transString(req.body.txtName) }).exec(function(err, found_product) {
                    if (err) {
                        req.session.sessionFlash = {
                            isArray: false,
                            type: 'error',
                            messages: err
                        }
                        res.redirect('back');
                    }

                    if (found_product) {
                        req.session.sessionFlash = {
                            isArray: false,
                            type: 'error',
                            messages: req.__('The product was exist, please try again other name.')
                        }
                        res.redirect('back');
                    } else {
                        newProduct.save(function(err, newProduct) {
                            if (err) { return next(err); }
                            req.session.sessionFlash = {
                                isArray: false,
                                type: 'success',
                                messages: req.__('The product was created successfully.')
                            }
                            delete req.session.addProductForm;
                            res.redirect('back');
                        });
                    }
                });
            }); // END RESIZE
        }
    }
};

/* =======================================
Edit product
========================================*/
exports.get_edit_product = function(req, res, next) {
    var listcategories = [];
    Category.find(function(err, categories) {
        listcategories = categories;
    });

    var id = req.params.id;
    Product.findById(id, function(err, product) {
        res.render('backend/products/edit', {
            pagetitle: 'Cập nhật sản phẩm',
            listcategories: listcategories,
            product: product,
            layout: 'backend'
        });
    });
}

exports.put_edit_product = function(req, res, next) {
    return Product.findById(req.params.id, function(err, product) {
        product.user = req.user._id;
        product.proName = req.body.proName;
        product.save(function(err) {
            if (!err) {
                console.log("Sản phẩm cập nhật thành công.");
            } else {
                console.log(err);
            }
            return res.send(product);
        });
    });
}