var async = require('async');

const apiConfig = require('../../../config/api');

const Account = require('../../../models/customer');
const Category = require('../../../models/category');
const Product = require('../../../models/product');

const Country = require('../../../models/country');
const Province = require('../../../models/provinces');
const District = require('../../../models/districts');
const Ward = require('../../../models/wards');

exports.get_home = function(req, res, next) {
    res.render('api/v' + apiConfig.api_version + '/home/index', {
        pageTitle: 'Wefuny Shopping Api version' + apiConfig.api_version,
        pageActive: ['homeNav'],
        layout: 'api'
    });
};

exports.get_page_district_by_id = function(req, res, next) {
    res.render('api/v' + apiConfig.api_version + '/districts/getDistrictById', {
        pageTitle: 'WS Api - District By ID',
        pageActive: ['page-district-by-id', 'districtsNav'],
        layout: 'api'
    });
};

exports.api_district_by_id = function(req, res, next) {
    const id = req.params.id_district;
    District.findOne({ id: { $eq: id } })
        .exec()
        .then(district => {
            console.log(district);
            if (district !== null) {
                const response = {
                    id: district.id,
                    name: district.name,
                    type: district.type,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/api/v1/district-by-id/' + district.id
                    }
                }
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    code: 'DistrictNotFound',
                    message: 'No district found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
};

exports.get_page_districts_by_province = function(req, res, next) {
    res.render('api/v' + apiConfig.api_version + '/districts/getAllDistrictsByProvince', {
        pageTitle: 'WS Api - All Districts By Province',
        pageActive: ['page-districts-by-province', 'districtsNav'],
        layout: 'api'
    });
};

exports.api_districts_by_province = function(req, res, next) {
    const id = req.params.id_province;
    District.find({ id_province: { $eq: id } })
        .exec()
        .then(districts => {
            if (districts.length > 0) {
                const response = {
                    count: districts.length,
                    districts: districts.map(district => {
                        return {
                            id: district.id,
                            name: district.name,
                            type: district.type,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/api/v1/district-by-id/' + district.id
                            }
                        }
                    })
                };
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    code: 'DistrictsNotFound',
                    message: 'No entries found'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
};

exports.isLoggedIn = function(req, res, next) {
    if (req.user && req.user.roles === "ADMIN" && req.user.provider === "backend") {
        return next();
    } else {
        return res.redirect('/');
    }
};