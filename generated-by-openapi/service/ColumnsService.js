'use strict';


const dbUtils = require('../utils/db-utils');

/**
 * Change name of a column in a table
 *
 * body NameRequest The payload with the new name of the column
 * dbId String The ID of the database
 * tableId String The ID of the table
 * columnId String The ID of the column
 * no response value expected for this operation
 **/
exports.updateColumnName = function(body,dbId,tableId,columnId) {
  return new Promise(function(resolve, reject) {
    dbUtils.renameTableColumn(
      dbId,
      tableId,
      columnId,
      body.name
    )
    resolve();
  });
}


/**
 * Add a column to a table.
 *
 * body AddColumnQuery The payload with the name and type of the new column
 * dbId String The ID of the database
 * tableId String The ID of the table
 * returns IdResponse
 **/
exports.createColumn = function(body,dbId,tableId) {
  return new Promise(function(resolve, reject) {
    resolve(dbUtils.addTableColumn(
      dbId,
      tableId,
      body.name,
      body.type
    ))
  });
}

/**
 * Delete a column from a table
 *
 * dbId String The ID of the database
 * tableId String The ID of the table
 * columnId String The ID of the column
 * no response value expected for this operation
 **/
exports.deleteColumn = function(dbId,tableId,columnId) {
  return new Promise(function(resolve, reject) {
    dbUtils.deleteTableColumn(dbId, tableId, columnId);
    resolve();
  });
}

