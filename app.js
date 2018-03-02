'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var compression = require('compression');
var helmet = require('helmet');
var MongoStore = require('connect-mongo')(session);

var configDB = require('./app/config/database');
var settings = require('./app/config/settings');
var apiConfig = require('./app/config/api');

//Test Router
var testRouter = require('./app/routes/test');

//Backend Router
var apiRoutes = require('./app/routes/api/v' + apiConfig.api_version + '/api');
var backendRoutes = require('./app/routes/backend');

//Frontend Router
var customerRoutes = require('./app/routes/customer');
var productRoutes = require('./app/routes/product');
var cartRoutes = require('./app/routes/cart');
var indexRoutes = require('./app/routes/index');

var app = express();

var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
if (ip === "127.0.0.1") {
    mongoose.Promise = global.Promise;
}

mongoose.connect(configDB.connectStr, { useMongoClient: true });
mongoose.connection.on('error', function(err) {
    console.log('Lỗi kết nối đến CSDL: ' + err);
});
require('./app/config/passport');

// view engine setup
var hbsConfig = expressHbs.create({
    helpers: require("./app/helpers/handlebars.js").helpers,
    layoutsDir: path.join(__dirname, '/templates/' + settings.default_template + '/layouts'),
    defaultLayout: path.join(__dirname, '/templates/' + settings.default_template + '/layouts/layout'),
    partialsDir: path.join(__dirname, '/templates/' + settings.default_template + '/common'),
    extname: '.hbs'
});
app.engine('.hbs', hbsConfig.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/templates/' + settings.default_template));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(compression()); //Compress all routes
app.use(logger('dev'));
app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', [
    express.static(__dirname + '/node_modules/jquery/dist/'),
    express.static(__dirname + '/node_modules/materialize-css/dist/'),
    express.static(__dirname + '/node_modules/ckeditor/ckeditor5-build-classic/build/'),
]);
app.use(cookieParser());
// Languages
i18n.configure({
    locales: ['en', 'vi'],
    register: global,
    fallbacks: { 'vi': 'en' },
    cookie: 'language',
    queryParameter: 'lang',
    defaultLocale: 'en',
    directory: __dirname + '/languages',
    directoryPermissions: '755',
    autoReload: true,
    updateFiles: true,
    api: {
        '__': '__', //now req.__ becomes req.__
        '__n': '__n' //and req.__n can be called as req.__n
    }
});

app.use(function(req, res, next) {
    i18n.init(req, res, next);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: settings.secured_key,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.clanguage = req.getLocale();
    res.locals.languages = i18n.getLocales();
    res.locals.baseUrl = req.header("host");
    res.locals.settings = settings;
    res.locals.apiConfig = apiConfig;
    res.locals.login = req.isAuthenticated();
    res.locals.customer = req.user;
    res.locals.session = req.session;
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

if (ip !== "127.0.0.1" || app.get('env') !== 'development') {
    app.all(/.*/, function(req, res, next) {
        var host = req.header("host");
        if (host.match(/^www\..*/i)) {
            next();
        } else {
            res.redirect(301, "http://www." + host);
        }
    });
}

app.get('/api', function(req, res, next) {
    res.redirect('/api/v' + apiConfig.api_version);
});

// Use Router Frontend
app.use('/', indexRoutes);
app.use('/cart', cartRoutes);
app.use('/khach-hang', customerRoutes);
app.use('/san-pham', productRoutes);

//Use Backend Router
app.use('/backoffice', backendRoutes);

// API
app.use('/api/v' + apiConfig.api_version, apiRoutes);

//Use Test Router
app.use('/test', testRouter);

// error handler
app.use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    req.session.sessionFlash = {
        type: 'error',
        message: req.__('The working session of the form has expired, please try again.')
    }
    res.redirect(req.url);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500 || 403);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500 || 403);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;