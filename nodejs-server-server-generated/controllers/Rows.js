'use strict';

var utils = require('../utils/writer.js');
var Rows = require('../service/RowsService');

module.exports.addRow = function addRow (req, res, next, body, dbId, tableId) {
  Rows.addRow(body, dbId, tableId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.updateCellValue = function updateCellValue (req, res, next, body, dbId, tableId, rowId) {
  Rows.updateCellValue(body, dbId, tableId, rowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteRow = function deleteRow (req, res, next, dbId, tableId, rowId) {
  Rows.deleteRow(dbId, tableId, rowId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
