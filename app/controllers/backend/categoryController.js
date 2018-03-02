var async = require('async'),
    mongoose = require('mongoose');

var settings = require('../../config/settings');

// Require Libraries
var libraries_category = require('../../libraries/Category');

var Category = require('../../models/category');
var Product = require('../../models/product');

exports.test = function(req, res, next) {
    libraries_category.cateUp(req.params.id, function(err, data) {
        if (err) {
            console.log(err);
        }
        res.send(data);
    });
};

exports.test1 = function(req, res) {
    var data = {};
    async.series([
        function(callback) {
            Category.find({ level: { $eq: 4 } }).exec(function(err, child4) {
                if (err) return callback(err);
                var addChild4 = [];
                child4.forEach(function(data4) {
                    addChild4.push({
                        id: data4._id,
                        name: data4.name,
                        child4: data4.child,
                        level: data4.level,
                        status: data4.status
                    });
                });
                data.child4 = addChild4;
                callback();
            });
        },
        function(callback) {
            Category.find({ level: { $eq: 3 } }).exec(function(err, child3) {
                if (err) return callback(err);
                var addChild3 = [];
                child3.forEach(function(data3) {

                    var dt4 = data.child4
                    var id3 = (data3._id).toString();
                    dt4.forEach(function(dt4) {
                        if (id3.indexOf(dt4.child4) >= 0) {
                            addChild3.push({ child3: dt4.id });
                        }
                    });
                    addChild3.push({
                        id: id3,
                        name: data3.name,
                        level: data3.level,
                        status: data3.status
                    });
                });
                data.child3 = addChild3;
                callback();
            });
        },
        function(callback) {
            Category.find({ level: { $eq: 2 } }).exec(function(err, child2) {
                if (err) return callback(err);
                var addChild2 = [];
                child2.forEach(function(data2) {

                    var dt3 = data.child3
                    var id2 = (data2._id).toString();
                    dt3.forEach(function(dt3) {
                        if (id2.indexOf(dt3.child3) >= 0) {
                            addChild2.push({ child2: dt3.id });
                        }
                    });

                    addChild2.push({
                        id: data2._id,
                        name: data2.name,
                        level: data2.level,
                        status: data2.status
                    });
                });
                data.child2 = addChild2;
                callback();
            });
        },
        function(callback) {
            Category.find({ level: { $eq: 1 } }).exec(function(err, category) {
                var addCategory = [];
                category.forEach(function(datacate) {
                    addCategory.push({
                        id: datacate._id,
                        name: datacate.name,
                        level: datacate.level,
                        childs: data.child2,
                        status: datacate.status
                    });
                });
                data.categories = addCategory;
                callback();
            });
        }
    ], function(err) {
        console.log(data.categories);
        res.render('backend/categories/test', {
            pagetitle: 'Testing...',
            getData: data,
            layout: 'backend'
        });
    });
};

exports.get_categories_list = function(req, res, next) {
    var page = req.query.page === undefined ? 1 : req.query.page;

    async.parallel({
        categories: function(callback) {
            libraries_category.listPage(1, { createdAt: -1 }, page, callback);
        },
        childs: function(callback) {
            libraries_category.subCategory(callback);
        }
    }, function(err, results) {

        res.render('backend/categories/list', {
            pagetitle: 'Danh mục loại sản phẩm',
            csrfToken: req.csrfToken(),
            categories: results.categories.docs,
            childs: results.childs,
            totalCategory: parseInt(results.categories.total),
            currentPage: parseInt(results.categories.page),
            nextPage: parseInt(results.categories.page) + 1,
            prevPage: parseInt(results.categories.page) - 1,
            totalPages: parseInt(results.categories.pages),
            layout: 'backend'
        });
    });
};

exports.get_add_category = function(req, res, next) {
    var hasId = (typeof req.params.id === 'undefined') ? false : true;
    async.parallel({
        categories: function(callback) {
            libraries_category.parentCategory(callback);
        },
        childs: function(callback) {
            libraries_category.subCategory(callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        var messages = req.flash('error');
        res.render('backend/categories/add', {
            pagetitle: 'Thêm mới danh mục sản phẩm',
            csrfToken: req.csrfToken(),
            theid: req.params.id,
            hasId: hasId,
            messages: messages,
            hasErrors: messages.length > 0,
            categories: results.categories,
            childs: results.childs,
            layout: 'backend'
        });
    });
};

exports.post_add_category = function(req, res, next) {
    req.checkBody('name', 'Tên danh mục không được bỏ trống').notEmpty();
    req.sanitize('name').escape();
    req.sanitize('name').trim();

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
        var name = req.body.name,
            getInputCategory = req.body.category,
            child = null,
            level = 0;

        if (parseInt(getInputCategory) === 1) { // Level 0
            level = parseInt(getInputCategory);
        } else { // Level 1 - 3
            var arrayChild = getInputCategory.split(":");
            child = arrayChild[0];
            level = parseInt(arrayChild[1]) + 1;
        }


        // Check exist category name
        Category.findOne({}).and([{ name: name }, { child: child }]).exec(function(err, found_category) {
            if (err) { return next(err); }
            if (found_category) {
                req.session.sessionFlash = {
                    isArray: false,
                    type: 'error',
                    messages: req.__('The category the same level was exist, please try again other name.')
                }
                res.redirect('back');
            } else {
                // Category
                var newCategory = new Category({
                    name: name,
                    child: child,
                    level: level,
                    status: req.body.status
                });
                newCategory.save(function(err) {
                    if (err) { return next(err); }
                    req.session.sessionFlash = {
                        isArray: false,
                        type: 'success',
                        messages: req.__('The category was created successfully.')
                    }
                    res.redirect('back');
                });
            }
        });
    }
};

exports.get_edit_category = function(req, res, next) {
    async.parallel({
        category_by_id: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        categories: function(callback) {
            Category.find({ level: { $eq: 1 } }).exec(callback);
        },
        childs: function(callback) {
            Category.find({ level: { $gt: 1 } }).exec(callback);
        }
    }, function(err, results) {

        if (err) {
            return next(err);
        }

        var messages = req.flash('error');
        res.render('backend/categories/edit', {
            pagetitle: 'Thêm mới danh mục sản phẩm',
            csrfToken: req.csrfToken(),
            categories: results.categories,
            childs: results.childs,
            category_by_id: results.category_by_id,
            messages: messages,
            hasErrors: messages.length > 0,
            layout: 'backend'
        });

    });
};

exports.post_edit_category = function(req, res, next) {
    req.checkBody('name', 'Tên danh mục không được bỏ trống').notEmpty();

    //Trim and escape the name field.
    req.sanitize('name').escape();
    req.sanitize('name').trim();

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

        var theid = req.params.id,
            name = req.body.name,
            inputChild = req.body.category,
            child = null,
            level = 0;
        if (parseInt(inputChild) === 0) { // Level 0
            level = parseInt(inputChild);
        } else { // Level 1 - 3
            arrayChild = inputChild.split(":");
            child = arrayChild[0];
            level = parseInt(arrayChild[1]) + 1;
        }

        Category.findOneAndUpdate({ _id: theid }, { $set: { name: name, child: child, level: level, status: req.body.status } }, { new: true }, function(err, doc) {
            if (err) {
                return next(err);
            }
            req.session.sessionFlash = {
                isArray: false,
                type: 'success',
                messages: req.__('The category was created successfully.')
            }
            res.redirect('/backoffice/categories');
        });
    }
};

exports.get_delete_category = function(req, res, next) {
    var id = req.params.id;
    async.parallel({
        hasChild: function(callback) {
            Category.find({ child: { $all: id } }).exec(callback);
        },
        products_count: function(callback) {
            Product.count({ categories: req.params.id }, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }

        if (results.hasChild.length) {
            req.session.sessionFlash = {
                isArray: false,
                type: 'error',
                messages: 'Bạn phải xóa các danh mục con của danh mục này trước, rồi thực hiện lại.'
            }
            res.redirect('back');
        } else {
            if (results.products_count > 0) {
                req.session.sessionFlash = {
                    isArray: false,
                    type: 'error',
                    messages: 'Danh mục này đã phát sinh <a style href="#"><strong>' + results.products_count + '</strong> sản phẩm</a>, vui lòng xóa hết sản phẩm của danh mục này rồi thực hiện lại.'
                }
                res.redirect('back');
            } else {
                Category.findByIdAndRemove(req.params.id, function deleteCategory(err, category) {
                    if (err) { return next(err); }
                    req.session.sessionFlash = {
                        isArray: false,
                        type: 'success',
                        messages: 'Danh mục: <strong>' + category.name + '</strong> đã được xóa thành công.'
                    }
                    res.redirect('back');
                });
            }
        }
    });
};