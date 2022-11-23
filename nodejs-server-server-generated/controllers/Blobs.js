'use strict';

var utils = require('../utils/writer.js');
var Blobs = require('../service/BlobsService');

module.exports.getBlob = function getBlob (req, res, next, blobId) {
  Blobs.getBlob(blobId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
