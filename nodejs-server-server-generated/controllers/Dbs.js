'use strict';

var utils = require('../utils/writer.js');
var Dbs = require('../service/DbsService');

module.exports.createDB = function createDB (req, res, next, body) {
  Dbs.createDB(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.dbsDbIdDELETE = function dbsDbIdDELETE (req, res, next, dbId) {
  Dbs.dbsDbIdDELETE(dbId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.dbsDbIdPOST = function dbsDbIdPOST (req, res, next, body, dbId) {
  Dbs.dbsDbIdPOST(body, dbId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getDB = function getDB (req, res, next, name) {
  Dbs.getDB(name)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.log(response);
      utils.writeJson(res, response);
    });
};

module.exports.getDBById = function getDBById (req, res, next, dbId) {
  Dbs.getDBById(dbId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
