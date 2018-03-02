'use strict';

let Jimp = require('jimp'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    fileType = require('file-type');

const settings = require('../../app/config/settings');
const common = require('../../app/libraries/Common');
const pathUpload = settings.uploadPath + '/products/';

module.exports = {
    productThumb(files) {

        let promises = [];
        _.forEach(files, (file) => {

            let promise = new Promise((resolve, reject) => {
                let type = fileType(file.buffer);
                new Jimp(file.buffer, (err, jimpImage) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var productImgSize = settings.productImgSize;
                    var randName = new Date().getTime().toString();
                    var thumbs = [];

                    _.forEach(productImgSize, (thumbSize) => {

                        if (typeof thumbSize !== null) {

                            var sizeThumb = thumbSize.width + "x" + thumbSize.height;
                            var typeThumb = thumbSize.size;
                            var nameThumb = "product-" + typeThumb + "-" + randName + "-" + sizeThumb + "." + common.getExtension(file.originalname);
                            var pathThumb = pathUpload + nameThumb;

                            jimpImage
                                .resize(thumbSize.width, thumbSize.height, Jimp.RESIZE_BEZIER)
                                .quality(thumbSize.quality) //thumbSize.quality
                                .getBuffer(type.mime, (err, buffer) => {
                                    let binaryImage = buffer.toString('binary');
                                    fs.writeFile(pathThumb, binaryImage, 'binary', (err) => {
                                        console.log(err);
                                    });

                                });

                            if (typeThumb === 'small') {
                                thumbs.push({ 'small': nameThumb });
                            } else if (typeThumb === 'medium') {
                                thumbs.push({ 'medium': nameThumb });
                            } else if (typeThumb === 'large') {
                                thumbs.push({ 'large': nameThumb });
                            }
                        }

                    });
                    //console.log(thumbs);
                    resolve(thumbs);
                });
            });
            promises.push(promise);
        });
        return Promise.all(promises);
    }
};