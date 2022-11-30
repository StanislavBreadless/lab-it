'use strict';

const dbUtils = require('../utils/db-utils');
const fsUtils = require('../utils/fs-utils');
const { notFound, dbNotFound } = require('../utils/utils');
const writer = require('../utils/writer');
const db = require('../utils/db');


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
exports.getTableInfo = function(intersection, dbId,tableId) {
  return new Promise(function(resolve, reject) {

    console.log(fsUtils.loadDatabases());
    console.log(dbId);
    console.log(tableId);
    console.log(intersection);
    const dbData = fsUtils.loadDatabases().find(db => db.id === dbId);

    if(!dbData) {
      dbNotFound();
    }
    
    const tableData = fsUtils.loadTableData(tableId); 

    if(!tableData) {
      notFound('Not found');
    }

    if(intersection) {
      console.log('here');
      const tableData2 = fsUtils.loadTableData(intersection);
      if(!tableData2) {
        notFound('Not found');
      }
      console.log('here2');

      const table1 = dbData.tables.find(table => table.id === tableId);
      const table2 = dbData.tables.find(table => table.id === intersection);
      console.log('t', table1);
      console.log('t1', table2);
      if(!table1 || !table2) {
        notFound('Not found');
      }
      console.log(JSON.stringify(tableData, null, 2));
      console.log(JSON.stringify(tableData2, null, 2));
      console.log('here3');
      const result = db.intersection(tableData, tableData2, table1, table2);
      console.log('here4');
      console.log(result);
      resolve(result)
    } else {
      resolve(tableData);
    }

  });
}

