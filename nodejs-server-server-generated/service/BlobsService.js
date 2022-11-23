'use strict';

const fsUtils = require('../utils/fs-utils');

/**
 * Retrieve an HTML blob
 *
 * blobId String The ID of the blob to retrieve
 * returns String
 **/
exports.getBlob = function(blobId) {
  return new Promise(function(resolve, reject) {
    resolve(fsUtils.loadBlob(blobId))
  });
}

