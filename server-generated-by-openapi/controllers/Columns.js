'use strict';

var utils = require('../utils/writer.js');
var Columns = require('../service/ColumnsService');

module.exports.updateColumnName = function updateColumnName (req, res, next, body, dbId, tableId, columnId) {
  Columns.updateColumnName(body, dbId, tableId, columnId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createColumn = function createColumn (req, res, next, body, dbId, tableId) {
  Columns.createColumn(body, dbId, tableId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteColumn = function deleteColumn (req, res, next, dbId, tableId, columnId) {
  Columns.deleteColumn(dbId, tableId, columnId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
