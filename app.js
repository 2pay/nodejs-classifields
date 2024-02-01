var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var i18n = require('i18n');
var bodyParser = require('body-parser');
var expHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');

var settings = require('./config/settings');
var database = require('./config/database');

var backendRoutes = require('./routes/backend');
var index = require('./routes/index');
var routerMember = require('./routes/member');

var app = express();

mongoose.connect(database.dbStr, { useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connection.on('error', function(err) {
    console.log('Error connect to Database: ' + err);
});

require('./config/passport');

// view engine setup
var hbsConfig = expHbs.create({
    helpers: require('./helpers/handlebars.js').helpers,
    layoutsDir: path.join(__dirname, '/templates/' + settings.defaultTemplate + '/layouts'),
    defaultLayout: path.join(__dirname, '/templates/' + settings.defaultTemplate + '/layouts/layout'),
    partialsDir: path.join(__dirname, '/templates/' + settings.defaultTemplate + '/partials'),
    extname: '.hbs'
});

app.engine('.hbs', hbsConfig.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/templates/' + settings.defaultTemplate));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(validator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

i18n.configure({
    locales: ['en', 'vi'],
    register: global,
    fallbacks: { 'vi': 'en' },
    cookie: 'language', // Tên của cookie trên browser nhé
    queryParameter: 'lang', // Đây là params trên url dùng thay đổi ngôn ngữ 
    defaultLocale: 'en', //Ngôn ngữ mặc định khi init nó sẽ tự tìm các chuỗi nằm trong hàm __ và __n để tự thêm vào file json
    directory: __dirname + '/languages',
    directoryPermissions: '755', // Thiết lập quyền ghi cho các file ngôn ngữ (chỉ dùng cho hệ thống nodejs trên linux)
    autoReload: true,
    updateFiles: true,
    api: {
        '__': '__', // Đây là 2 hàm dùng trong template dịch ngôn ngữ nhé. Các bạn cũng có thể thay đổi tên của nó (nên để mặc địch)
        '__n': '__n'
    }
});

app.use(session({
    secret: settings.secured_key,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    i18n.init(req, res, next);
});

app.use(function(req, res, next) {
    res.locals.clanguage = req.getLocale(); // Ngôn ngữ hiện tại
    res.locals.languages = i18n.getLocales(); // Danh sách ngôn ngữ khai báo trong phần cấu hình bên trên.
    res.locals.settings = settings;
    res.locals.logged = req.isAuthenticated();
    res.locals.member = req.user;
    next();
});

app.use('/', index);
app.use('/thanh-vien', routerMember);
app.use('/backoffice', backendRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;