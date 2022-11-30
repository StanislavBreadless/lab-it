'use strict';

const dbUtils = require('../utils/db-utils');
const fsUtils = require('../utils/fs-utils');
const utils = require('../utils/utils')
const writer = require('../utils/writer');

/**
 *
 * body Dbs_body The payload with the name of the database to create
 * returns IdResponse
 **/
exports.createDB = function(body) {
  return new Promise(function(resolve, reject) {
    console.log(body.name);
    const id = dbUtils.addDb(body.name);
    console.log('aaaa');
    console.log(id); 
    resolve(dbUtils.addDb(body.name));
  });
}


/**
 * Delete the database.
 *
 * dbId String The name of the database to retrieve
 * no response value expected for this operation
 **/
exports.dbsDbIdDELETE = function(dbId) {
  return new Promise(function(resolve, reject) {
    dbUtils.deleteDb(dbId)
    resolve();
  });
}


/**
 * Edit name of the database.
 *
 * body Dbs_dbId_body The payload with the name of the database to change to
 * dbId String The name of the database to retrieve
 * no response value expected for this operation
 **/
exports.dbsDbIdPOST = function(body,dbId) {
  return new Promise(function(resolve, reject) {
    dbUtils.changeDbName(dbId, body.name);
    resolve();
  });
}

/**
 * Retrive information about a database/databases.
 * Retrievies the list of all database or a particular one.
 *
 * name String The name of the database to retrieve (optional)
 * returns List
 **/
exports.getDB = function(name) {
  return new Promise(function(resolve, reject) {
    
    const dbs = fsUtils.loadDatabases();
    if(name) {
      console.log(name);
      const db = dbs.find(db => db.name === name);
      if (!db) {
        utils.dbNotFound();
      }
      resolve([db]);
    } else {
      resolve(dbs)
    }
  });
}


/**
 * Retrive information about a database.
 * Retrieve information about a particular DB.
 *
 * dbId String The ID of the database to retrieve
 * returns List
 **/
exports.getDBById = function(dbId) {
  return new Promise(function(resolve, reject) {
    const dbs = fsUtils.loadDatabases();
    const db = dbs.find(db => db.id === dbId);

    if(db) {
      resolve(db);
    } else {
      reject(writer.respondWithCode(404, 'Not found'))
    }
  });
}

