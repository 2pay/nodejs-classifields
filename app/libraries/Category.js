const async = require('async');
const Setting = require('../config/settings');
const Category = require('../models/category');

var libsCategory = module.exports;

libsCategory.listPage = function listPage(level, sort, page, callback) {
    var options = {
        page: page,
        limit: Setting.adminListPerPage,
        sort: sort
    };
    Category.paginate({ level: { $eq: level } }, options, callback);
}

libsCategory.parentCategory = function parentCategory(callback) {
    Category.find({ level: { $eq: 1 } }).exec(callback);
}

libsCategory.subCategory = function subCategory(callback) {
    Category.find({ level: { $gt: 1 } }).exec(callback);
}

libsCategory.cateUp = function cateUp(id, callback) {
    var arrayId = [];
    Category.findOne({ _id: id }, function(err, find1) {
        if (err) {
            callback(err, null);
        } else {
            var level = find1.level;
            var child1 = find1.child[0];
            if (level === 1) { // Level 1
                arrayId.push(id);
                callback(null, arrayId);
            } else if (level === 2) { // Level 2
                arrayId.push(id, child1);
                callback(null, arrayId);
            } else if (level === 3) { // Level 3
                Category.findOne({ _id: child1 }, function(err, find3) {
                    if (err) { callback(err) }
                    var child2 = find3.child[0];
                    arrayId.push(id, child1, child2);
                    callback(null, arrayId);
                });
            } else if (level === 4) {
                Category.findOne({ _id: child1 }, function(err, find3) {
                    if (err) {
                        callback(err);
                    } else {
                        var child2 = find3.child[0];
                        Category.findOne({ _id: child2 }, function(err, find4) {
                            if (err) {
                                callback(err);
                            } else {
                                arrayId.push(id, child1, child2, find4._id);
                                callback(null, arrayId);
                            }
                        });
                    }
                });
            } else {
                callback(null, []);
            }
        }
    });
}

libsCategory.getCategoryName = function getName(id) {
    Category.find({ _id: id }).exec(function(err, categories) {
        if (err) return res.json(err);
        return categories.map(
            function(category) {
                if (category.hasOwnProperty('name')) return category.name;
                return null;
            });
    });
}