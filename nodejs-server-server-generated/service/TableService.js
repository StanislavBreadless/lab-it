'use strict';

const dbUtils = require('../utils/db-utils');
const fsUtils = require('../utils/fs-utils');
const writer = require('../utils/writer');


/**
 * Create table for a database.
 *
 * body NameRequest The payload with the name of the table to create
 * dbId String The ID of the database to add the table to
 * returns IdResponse
 **/
exports.createTable = function(body,dbId) {
  return new Promise(function(resolve, reject) {
    resolve(dbUtils.addTable(dbId, body.name));
  });
}


/**
 * Delete a table from a database.
 *
 * dbId String The ID of the database
 * tableId String The ID of the table
 * no response value expected for this operation
 **/
exports.deleteTable = function(dbId,tableId) {
  return new Promise(function(resolve, reject) {
    dbUtils.deleteTable(dbId, tableId);
    resolve();
  });
}


/**
 * Edit table's name.
 *
 * body NameRequest The payload with the name of the new table name
 * dbId String The ID of the database
 * tableId String The ID of the table
 * returns IdResponse
 **/
exports.editTableName = function(body,dbId,tableId) {
  return new Promise(function(resolve, reject) {
    dbUtils.editTableName(dbId, tableId, body.name);
    resolve();
  });
}

/**
 * Get all the data from the table.
 *
 * dbId String The ID of the database
 * tableId String The ID of the table
 * returns TableData
 **/
exports.getTableInfo = function(dbId,tableId) {
  return new Promise(function(resolve, reject) {
    
    const tableData = fsUtils.loadTableData(tableId); 

    resolve(tableData);
  });
}

