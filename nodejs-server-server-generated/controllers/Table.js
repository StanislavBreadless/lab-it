'use strict';

var utils = require('../utils/writer.js');
var Table = require('../service/TableService');

module.exports.createTable = function createTable (req, res, next, body, dbId) {
  Table.createTable(body, dbId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteTable = function deleteTable (req, res, next, dbId, tableId) {
  Table.deleteTable(dbId, tableId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.editTableName = function editTableName (req, res, next, body, dbId, tableId) {
  Table.editTableName(body, dbId, tableId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getTableInfo = function getTableInfo (req, res, next, dbId, tableId) {
  Table.getTableInfo(dbId, tableId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
