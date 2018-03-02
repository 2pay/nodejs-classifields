var numeral = require('numeral');
var i18n = require('i18n');
var moment = require('moment');

const settings = require('../../app/config/settings');
const library_common = require('../../app/libraries/Common');
const library_category = require('../../app/libraries/Category');

var register = function(Handlebars) {
    var helpers = {
        dump: function(context) {
            return '<div style="background: #000;padding: 10px;">' + JSON.stringify(context) + '</div>';
        },
        __: function(req, res) {
            return i18n.__.apply(this, arguments);
        },
        __n: function() {
            return i18n.__n.apply(this, arguments);
        },
        //Start Cart
        total_cost_vat_applied(before_cost) {
            var vat = parseInt(before_cost) * parseInt(settings.vat) / 100;
            return before_cost - vat;
        },
        getVat(money) {
            return parseInt(money) * parseInt(settings.vat) / 100;
        },
        // End Cart
        getMonthName() {
            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            var d = new Date();
            return monthNames[d.getMonth()];
        },
        getDay() {
            var d = new Date();
            return d.getDate();
        },
        getDayName() {
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var d = new Date();
            return days[d.getDay()];
        },
        getCategoryName(id) {
            console.log(library_category.getCategoryName(id));
            return library_category.getCategoryName(id);
        },
        buildUrl(router, slug, id, ext) {
            return '/' + router + '/' + slug + '-' + id + '.' + settings.urlExt;
        },
        arrayContains(needle, arrhaystack, options) {
            if (arrhaystack instanceof Array) {
                if (arrhaystack.indexOf(needle) > -1) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            } else {
                return options.inverse(this);
            }
        },
        vnToEn: function(str) {
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
            str = str.replace(/-+-/g, "-");
            str = str.replace(/^\-+|\-+$/g, "");
            return str;
        },
        formatPhoneNumber: function(phone) {
            if (typeof phone !== 'undefined') {
                if (phone.length === 10) {
                    var s2 = ("" + phone).replace(/\D/g, '');
                    var m = s2.match(/^(\d{4})(\d{3})(\d{3})$/);
                    return (!m) ? null : "" + m[1] + " " + m[2] + " " + m[3];
                } else if (phone.length === 11) {
                    var s2 = ("" + phone).replace(/\D/g, '');
                    var m = s2.match(/^(\d{5})(\d{3})(\d{3})$/);
                    return (!m) ? null : "" + m[1] + " " + m[2] + " " + m[3];
                }
            }

        },
        substr: function(maxlength, context) {
            return (context.match(RegExp(".{" + maxlength + "}\\S*")) || [context + "..."])[0];
        },
        formatCurrency: function(currency) {
            if (currency) {
                return currency.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            } else {
                return 0;
            }
        },
        formatUsd: function(currency) {
            return currency.toFixed(2);
        },
        split_keywords: function(keywords) {
            if (keywords) {
                var array = keywords.split(',');
                var links = "";
                for (var i = 0; i < array.length; i++) {
                    if (array[i].trim() != "") {
                        links += "<a href='/search/" + array[i].trim() + "'>" + array[i].trim() + "</a>&nbsp;|&nbsp;";
                    }
                }
                return links.substring(0, links.length - 1);
            } else {
                return keywords;
            }
        },
        format_amount: function(amt) {
            return numeral(amt).format('$0.00');
        },
        object_length: function(obj) {
            return Object.keys(obj).length;
        },
        checked_state: function(state) {
            if (state == "true") {
                return "checked"
            } else {
                return "";
            }
        },
        select_state: function(state, value) {
            if (state == value) {
                return "selected"
            } else {
                return "";
            }
        },
        view_count: function(value) {
            if (value == "" || value == undefined) {
                return "0";
            } else {
                return value;
            }
        },
        format_date: function(date, format) {

            if (format != '') {
                return moment(date).format('DD/MM/YYYY, h:mm:ss A');
            } else {
                return moment(date).format('DD/MM/YYYY, h:mm:ss A');
            }
        },
        foreach: function(arr, options) {
            if (options.inverse && !arr.length)
                return options.inverse(this);

            return arr.map(function(item, index) {
                item.$index = index;
                item.$first = index === 0;
                item.$last = index === arr.length - 1;
                return options.fn(item);
            }).join('');
        },
        ifCond: function(v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },
        ifIn: function(elem, list, options) {
            if (list.indexOf(elem) > -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        is_an_admin: function(value, options) {
            if (value == "true") {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        getClientIP: function(req) {
            return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        },
        setVariable: function(name, value, context) {
            this[name] = value;
        },
        indexOf: function(text, words, options) {
            if (!words) {
                return;
            } else {
                if (words.indexOf(text) >= 0) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            }
        },
        childOf: function(child, id, options) {
            if (!words) {
                return;
            } else {
                if (id.indexOf(child) >= 0) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            }
        },
        ifObjectId: function(ob, str, options) {
            if (ob && str) {
                if (ob.toString() === str.toString()) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            } else {
                return;
            }
        },
        discount: function(standard, sales) {
            if (standard && sales) {
                return parseFloat((standard - sales) / sales * 100).toFixed(2);
            } else {
                return 0;
            }
        }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }

};

module.exports.register = register;
module.exports.helpers = register(null);