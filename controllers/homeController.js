var Member = require('../models/member');

function redirectBack(req, res) {
    res.redirect(req.get('Referrer') || '/');
}

exports.lang_en = function(req, res, next) {
    res.cookie('language', 'en', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_vi = function(req, res, next) {
    res.cookie('language', 'vi', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_zh = function(req, res, next) {
    res.cookie('language', 'zh', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_ko = function(req, res, next) {
    res.cookie('language', 'ko', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_ja = function(req, res, next) {
    res.cookie('language', 'ja', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.index = function(req, res, next) {
    res.render('frontend/home/index', {
        pageTitle: req.__('Classifield Website')
    });
}
