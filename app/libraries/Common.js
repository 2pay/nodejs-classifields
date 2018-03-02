module.exports = {
    remove_duplicates_safe(arr) {
        var seen = {};
        var ret_arr = [];
        for (var i = 0; i < arr.length; i++) {
            if (!(arr[i] in seen)) {
                ret_arr.push(arr[i]);
                seen[arr[i]] = true;
            }
        }
        return ret_arr;
    },
    transString(str) {
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
    getExtension(fname) {
        fname = fname.toLowerCase();
        return fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
    },
    removeExtension(fname) {
        fname = fname.toLowerCase();
        var lastDotPosition = fname.lastIndexOf(".");
        if (lastDotPosition === -1) return fname;
        else return fname.substr(0, lastDotPosition);
    },
    getFileName(fname) {
        return this.transString(this.removeExtension(fname)) + "-" + Date.now() + "." + this.getExtension(fname);
    }

}