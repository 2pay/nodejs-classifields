var nodemailer = require('nodemailer');
var mailerHbs = require('nodemailer-express-handlebars');
var smtpTransport = require('nodemailer-smtp-transport');

var settings = require('../config/settings');

var mailer = nodemailer.createTransport(smtpTransport({
	host: settings.mailOptions.host,
	port: settings.mailOptions.port,
	secure: settings.mailOptions.secure, // use SSL
	tls: {
		rejectUnauthorized: true
	},
	auth: {
		user: settings.mailOptions.auth.user,
		pass: settings.mailOptions.auth.pass
	}
}));

mailer.use('compile', mailerHbs({
	viewPath: 'templates/' + settings.default_template + '/emails',
	extName: '.hbs'
}));

module.exports = mailer;