import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import { loadDatabases, loadTableData, addDb, editTableName, addTableColumn, deleteTableColumn, renameTableColumn, addTable, deleteTable, deleteDb, addTableRow, editTableRow, deleteTableRow, changeDbName } from './db-utils';
import { strToColumnType } from './db';
import { table } from 'console';

const cors = require('cors');

dotenv.config()


const app: Express = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;

/// Get list of all dbs
app.get('/dbs', (req: Request, res: Response) => {
    const dbs = loadDatabases();
    res.setHeader('Content-Type', 'application/json');

    const name = req.query.name;
    if(name) {
        const db = dbs.find(db => db.name === name);
        if(!db) {
            res.status(404);
            res.end('Db not found')
            return;
        }
        res.end(JSON.stringify(db));
    } else {    
        res.end(JSON.stringify(dbs));
    }
});

/// Create a db
/// Returns its ID
app.post('/dbs', (req, res) => {
    console.log('here', req.body);
    const name = req.body.name;
    console.log(req.body);

    if (!name || !(typeof name == 'string')) {
        console.log('lya');
        res.status(400);
        res.end('Invalid request');
        return;
    }

    const id = addDb(name);
    console.log('id', id);

    res.setHeader('Content-Type', 'application/json');
    res.send(id);
});

/// Get information about a DB by Id
app.get('/dbs/:dbId', (req: Request, res: Response) => {
    const { dbId } = req.params;
    console.log(dbId);

    const dbs = loadDatabases();

    // Double-checking that the table does indeed correspond to that db 
    if(!dbs.find(db => db.id === dbId)) {
        res.status(404);
        res.end('There is no db with such Id');
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(dbs[dbs.findIndex(db => db.id == dbId)]);
});

app.post('/dbs/:dbId', (req, res) => {
    const { dbId } = req.params;
    const name = req.body.name;

    changeDbName(dbId, name);

    res.status(200);
    res.end('{}');
});

app.delete('/dbs/:dbId', (req: Request, res: Response) => {
    const { dbId } = req.params;

    res.setHeader('Content-Type', 'application/json');
    const dbs = loadDatabases();
   
    if(!dbs.find(db => db.id === dbId)) {
        res.status(404);
        res.end('There is no db with such Id');
        return;
    }

    deleteDb(dbId);

    res.status(200);
    res.end('{}')
});


/// Create a new table for a db
/// Returns the new table's ID
app.post('/dbs/:dbId/tables', (req, res) => {
    const { dbId } = req.params; 
    // console.log(req.body);
    const { name } = req.body;
    const dbs = loadDatabases();
    
    if(!dbs.find(db => db.id === dbId)) {
        res.status(404);
        res.end('Db not found');
        return;
    }

    if(!name) {
        res.status(400);
        res.end('Invalid name');
        return;
    }

    const tableId = addTable(dbId, name);
    console.log(tableId);
    res.status(200);
    res.end(JSON.stringify(tableId));
});

/// Get all the data from the table
app.get('/dbs/:dbId/tables/:tableId', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');

    const { dbId, tableId } = req.params;
    const dbs = loadDatabases();

    if(!dbs.find(db => db.id === dbId)) {
        res.status(404);
        res.end('Db not found');
        return;
    }

    // Double-checking that the table does indeed correspond to that db 
    if( dbs[dbs.findIndex(db => db.id == dbId)].tables.filter((table) => table.id == tableId).length == 0 ) {
        res.status(404);
        res.end('There is no table with such Id in the db');
        return;
    }

    const tableData = loadTableData(tableId);

    if (!tableData) {
        res.status(404);
        res.end('There is no table with such Id in the db');
        return;
    }

    res.end(JSON.stringify(tableData))
});

/// Edit table's name
app.post('/dbs/:dbId/tables/:tableId', (req, res) => {
    const { dbId, tableId } = req.params;
    const name: string = req.body.name;

    checkForExistence(res, dbId, tableId);
    editTableName(dbId, tableId, name);

    res.status(200);
    res.end('{}');
})

/// Delete a table
app.delete('/dbs/:dbId/tables/:tableId', (req, res) => {
    const { dbId, tableId } = req.params;
    deleteTable(dbId, tableId);

    res.status(200);
    res.end('{}');
})

interface AddColumnQuery {
    name: string,
    type: string
}

/// Add a column to the table
app.post('/dbs/:dbId/tables/:tableId/columns', (req, res) => {
    const { dbId, tableId } = req.params;
    const query: AddColumnQuery = req.body;

    checkForExistence(res, dbId, tableId);
    const id = addTableColumn(dbId, tableId, query.name, strToColumnType(query.type));

    res.status(200);
    res.end(JSON.stringify(id));
})

/// Change column's name
app.post('/dbs/:dbId/tables/:tableId/columns/:columnId', (req, res) => {
    const { dbId, tableId, columnId } = req.params;
    const name: string = req.body.name;

    checkForExistence(res, dbId, tableId);
    renameTableColumn(dbId, tableId, columnId, name);

    res.status(200);
    res.end('{}');
})

/// Delete column
app.delete('/dbs/:dbId/tables/:tableId/columns/:columnId', (req, res) => {
    const { dbId, tableId, columnId } = req.params;

    checkForExistence(res, dbId, tableId);
    deleteTableColumn(dbId, tableId, columnId);

    res.status(200);
    res.end('{}');
})

/// Add a row to the table
app.post('/dbs/:dbId/tables/:tableId/rows', (req, res) => {
    const { dbId, tableId } = req.params;

    console.log('BODY\n\n', req.body);


    checkForExistence(res, dbId, tableId);
    const rowId = addTableRow(dbId, tableId, req.body);

    res.status(200);    
    res.end(JSON.stringify(rowId));
});

interface EditCellData {
    colId: string,
    newValue: string
}

/// Edit something about a row in a table
app.post('/dbs/:dbId/tables/:tableId/rows/:rowId', (req, res) => {
    const { dbId, tableId, rowId } = req.params;
    const reqBody: EditCellData = req.body;

    editTableRow(dbId, tableId, rowId, reqBody.colId, reqBody.newValue);

    res.status(200);
    res.end('{}')
})

/// Delete a row in a table
app.delete('/dbs/:dbId/tables/:tableId/rows/:rowId', (req, res) => {
    const { dbId, tableId, rowId } = req.params;

    deleteTableRow(dbId, tableId, rowId);
    res.status(200);
    res.end('{}')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

function checkForExistence(res: Record<any,any>, dbId: string, tableId?: string) {
    const dbs = loadDatabases();

    if(!dbs.find(db => db.id === dbId)) {
        res.status(404);
        res.end('There is no table with such Id in the db');
        return;
    }

    if(tableId) {
        // Double-checking that the table does indeed correspond to that db 
        if( dbs[dbs.findIndex(db => db.id == dbId)].tables.filter((table) => table.id == tableId).length == 0 ) {
            res.status(404);
            res.end('There is no table with such Id in the db');
            return;
        }
    }
}

