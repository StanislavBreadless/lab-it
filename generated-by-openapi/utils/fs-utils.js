// This file should be the only point for interaction with
// the files.

const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("fs");
const sha256 = require('fast-sha256').default;
const { DatabaseMeta, TableData } =  require("./db");
const { table } = require("console");
const { errorWithStatus } = require("./utils");

const DB_INFO_FILE = 'data/db_info.json';
const TABLE_FOLDER = 'data/tables';
const BLOBS_FOLDER = 'data/blobs';


module.exports.loadDatabases = function loadDatabases() {
    return JSON.parse(readFileSync(DB_INFO_FILE).toString());
}

module.exports.saveDatabases = function saveDatabases(db) {
    console.log(db);
    console.log(JSON.stringify(db));
    // console.log('orig:',  db);
    // for(const dbs of db) {
    //     for(const table of dbs.tables) {
    //         console.log('table: ', table);
    //     }
    // }
    // console.log('SAVE: ', JSON.stringify(db));
    writeFileSync(DB_INFO_FILE, JSON.stringify(db));
}

module.exports.loadTableData = function loadTableData(tableId) {
    let tableData;
    try { tableData = readFileSync(`${TABLE_FOLDER}/${tableId}`).toString(); }
    catch(e) {
        tableData = JSON.stringify(new TableData());
    }

    return JSON.parse(tableData);
}

module.exports.deleteTableData = function deleteTableData(tableId) {
    const file  = `${TABLE_FOLDER}/${tableId}`;
    if(existsSync(file)) {
        rmSync(file);
    }
}

module.exports.saveTableData = function saveTableData(tableId, data) {
    if(!existsSync(`${TABLE_FOLDER}`)) {
        mkdirSync(`${TABLE_FOLDER}`);
    }
    const strData = JSON.stringify(data);
    writeFileSync(`${TABLE_FOLDER}/${tableId}`, strData);
}

function blobFile(blobHash) {
    return `${BLOBS_FOLDER}/${blobHash}`
}

module.exports.saveBlob = function (blob) {
    const blobHash = Buffer.from(sha256(Buffer.from(blob, 'utf8'))).toString('hex');
    const filePath = blobFile(blobHash);

    if(!existsSync(filePath)) {
        writeFileSync(filePath, blob);
    }

    return blobHash;
}
module.exports.loadBlob = function(blobHash) {
    const filePath = blobFile(blobHash);

    if(!existsSync(filePath)) {
        errorWithStatus('Blob not found', 404);
        throw new Error('unreachable');
    }
    return readFileSync(filePath).toString();
}
