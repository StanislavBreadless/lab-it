'use strict';

const dbUtils = require('../utils/db-utils');
const fsUtils = require('../utils/fs-utils');
const writer = require('../utils/writer');

/**
 * Add table's row.
 *
 * body List The payload with the new row's content
 * dbId String The ID of the database
 * tableId String The ID of the table
 * returns IdResponse
 **/
exports.addRow = function(body,dbId,tableId) {
  return new Promise(function(resolve, reject) {
    resolve(dbUtils.addTableRow(
      dbId,
      tableId,
      body
    ))
  });
}

/**
 * Update a value in a cell in a particular row.
 *
 * body EditCellRequest The payload with the information on which cell to update
 * dbId String The ID of the database
 * tableId String The ID of the table
 * rowId String The ID of the row
 * no response value expected for this operation
 **/
exports.updateCellValue = function(body,dbId,tableId,rowId) {
  return new Promise(function(resolve, reject) {
    dbUtils.editTableRow(
      dbId,
      tableId,
      rowId,
      body.colId,
      body.newValue
    )
    resolve();
  });
}


/**
 * Delete a row from a table
 *
 * dbId String The ID of the database
 * tableId String The ID of the table
 * rowId String The ID of the row
 * no response value expected for this operation
 **/
exports.deleteRow = function(dbId,tableId,rowId) {
  return new Promise(function(resolve, reject) {

    dbUtils.deleteTableRow(dbId, tableId, rowId);

    resolve();
  });
}

