// This file should be the only point for interaction with
// the files.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import sha256 from 'fast-sha256';
import { DatabaseMeta, TableData } from "./db";
import { table } from "console";

const DB_INFO_FILE = 'data/db_info.json';
const TABLE_FOLDER = 'data/tables';
const BLOBS_FOLDER = 'data/blobs';


export function loadDatabases(): DatabaseMeta[] {
    return JSON.parse(readFileSync(DB_INFO_FILE).toString());
}

export function saveDatabases(db: DatabaseMeta[]) {
    // console.log('orig:',  db);
    // for(const dbs of db) {
    //     for(const table of dbs.tables) {
    //         console.log('table: ', table);
    //     }
    // }
    // console.log('SAVE: ', JSON.stringify(db));
    writeFileSync(DB_INFO_FILE, JSON.stringify(db));
}

export function loadTableData(tableId: string): TableData {
    let tableData;
    try { tableData = readFileSync(`${TABLE_FOLDER}/${tableId}`).toString(); }
    catch(e) {
        tableData = JSON.stringify(new TableData());
    }

    return JSON.parse(tableData);
}

export function deleteTableData(tableId: string) {
    const file  = `${TABLE_FOLDER}/${tableId}`;
    if(existsSync(file)) {
        rmSync(file);
    }
}

export function saveTableData(tableId: string, data: TableData) {
    if(!existsSync(`${TABLE_FOLDER}`)) {
        mkdirSync(`${TABLE_FOLDER}`);
    }
    const strData = JSON.stringify(data);
    writeFileSync(`${TABLE_FOLDER}/${tableId}`, strData);
}

function blobFile(blobHash: string): string {
    return `${BLOBS_FOLDER}/${blobHash}`
}

export function saveBlob(blob: string) {
    const blobHash = Buffer.from(sha256(Buffer.from(blob, 'utf8'))).toString('hex');
    const filePath = blobFile(blobHash);

    if(!existsSync(filePath)) {
        writeFileSync(filePath, blob);
    }

    return blobHash;
}




