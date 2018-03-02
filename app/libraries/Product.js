const settings = require('../../app/config/settings');

module.exports = {
    buildUrl(router, slug, id) {
        return '/' + router + '/' + slug + '-' + id + '.' + settings.urlExt;
    },
    getIdUrl(url) {
        if (url) {
            return url.split("-").pop().split(".")[0];

        } else {
            return null;
        }
    }
}