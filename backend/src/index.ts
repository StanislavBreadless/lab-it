import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import { loadDatabases, loadTableData, addDb, editTableName, addTableColumn, deleteTableColumn, renameTableColumn, addTable, deleteTable, deleteDb, addTableRow, editTableRow, deleteTableRow, changeDbName, loadBlob } from './db-utils';
import { ColumnType, intersection, strToColumnType } from './db';
import { dbNotFound, errorWithStatus, invalidRequest, notFound, tableNotFound } from './utils';

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
            dbNotFound();
        }
        res.json(db);
    } else {    
        res.json(dbs);
    }
});

/// Create a db
/// Returns its ID
app.post('/dbs', (req, res) => {
    const name = req.body.name;

    if (!name || !(typeof name == 'string')) {
        invalidRequest();
        return;
    }

    const id = addDb(name);

    res.setHeader('Content-Type', 'application/json');
    res.send(id);
});

/// Get information about a DB by Id
app.get('/dbs/:dbId', (req: Request, res: Response) => {
    const { dbId } = req.params;

    const dbs = loadDatabases();
    const db = dbs.find(db => db.id === dbId);

    // Double-checking that the table does indeed correspond to that db 
    if(!db) {
        dbNotFound();
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(db);
});

app.post('/dbs/:dbId', (req, res) => {
    const { dbId } = req.params;
    const name = req.body.name;

    changeDbName(dbId, name);

    res.status(200);
    res.json({});
});

app.delete('/dbs/:dbId', (req: Request, res: Response) => {
    const { dbId } = req.params;

    res.setHeader('Content-Type', 'application/json');
    const dbs = loadDatabases();
   
    if(!dbs.find(db => db.id === dbId)) {
        dbNotFound();
        return;
    }

    deleteDb(dbId);

    res.status(200);
    res.json({})
});


/// Create a new table for a db
/// Returns the new table's ID
app.post('/dbs/:dbId/tables', (req, res) => {
    const { dbId } = req.params; 
    const { name } = req.body;
    const dbs = loadDatabases();
    
    const db = dbs.find(db => db.id === dbId);

    if(!db) {
        dbNotFound();
    }

    if(!name) {
        errorWithStatus('Invalid name', 400);
    }

    const tableId = addTable(dbId, name);
    res.status(200).json(tableId);
});

/// Get all the data from the table
app.get('/dbs/:dbId/tables/:tableId', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');

    const { dbId, tableId } = req.params;
    const dbs = loadDatabases();

    const db = dbs.find(db => db.id === dbId);

    if(!db) {
        dbNotFound();
        return;
    }

    const table1 = db.tables.filter((table) => table.id == tableId)[0];

    // Double-checking that the table does indeed correspond to that db 
    if(!table1) {
        tableNotFound();
        return;
    }

    const tableData = loadTableData(tableId);

    if (!tableData) {
        tableNotFound();
        return;
    }

    let result = tableData;

    if(req.query.intersection) {
        const table2Id = req.query.intersection;
        const table2 = db.tables.filter((table) => table.id == table2Id)[0];

        // Double-checking that the table does indeed correspond to that db 
        if(!table2) {
            tableNotFound();
            return;
        }

        const tableData2 = loadTableData(table2Id.toString());
        if(!tableData2) {
            tableNotFound();
            return;    
        }

        result = intersection(tableData, tableData2, table1, table2);
        res.json(result)
        return;
    }

    res.json(tableData)
});

/// Edit table's name
app.post('/dbs/:dbId/tables/:tableId', (req, res) => {
    const { dbId, tableId } = req.params;
    const name: string = req.body.name;

    checkForExistence(res, dbId, tableId);
    editTableName(dbId, tableId, name);

    res.status(200);
    res.json({});
})

/// Delete a table
app.delete('/dbs/:dbId/tables/:tableId', (req, res) => {
    const { dbId, tableId } = req.params;
    deleteTable(dbId, tableId);

    res.status(200);
    res.json({});
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

    let colType: ColumnType;
    try {
        colType = strToColumnType(query.type);
    } catch(e) {
        errorWithStatus('Invalid column type', 400);
        return;
    }

    const id = addTableColumn(dbId, tableId, query.name, colType);

    res.status(200);
    res.json(id);
})

/// Change column's name
app.post('/dbs/:dbId/tables/:tableId/columns/:columnId', (req, res) => {
    const { dbId, tableId, columnId } = req.params;
    const name: string = req.body.name;

    checkForExistence(res, dbId, tableId);
    renameTableColumn(dbId, tableId, columnId, name);

    res.status(200);
    res.json({});
})

/// Delete column
app.delete('/dbs/:dbId/tables/:tableId/columns/:columnId', (req, res) => {
    const { dbId, tableId, columnId } = req.params;

    checkForExistence(res, dbId, tableId);
    deleteTableColumn(dbId, tableId, columnId);

    res.status(200);
    res.json({});
})

/// Add a row to the table
app.post('/dbs/:dbId/tables/:tableId/rows', (req, res) => {
    const { dbId, tableId } = req.params;

    checkForExistence(res, dbId, tableId);
    console.log('BODY: ', req.body);
    const rowId = addTableRow(dbId, tableId, req.body);

    res.status(200);    
    res.json(rowId);
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
    res.json({})
})

/// Delete a row in a table
app.delete('/dbs/:dbId/tables/:tableId/rows/:rowId', (req, res) => {
    const { dbId, tableId, rowId } = req.params;

    deleteTableRow(dbId, tableId, rowId);
    res.status(200);
    res.json({})
})

/// Get a blob from a table
app.get('/blobs/:blobId', (req, res) => {
    const { blobId } = req.params;

    const blob = loadBlob(blobId);
    
    res.status(200).json({
        data: blob
    });
})


function checkForExistence(res: Record<any,any>, dbId: string, tableId?: string) {
    const dbs = loadDatabases();

    const db = dbs.find(db => db.id === dbId);

    if(!db) {
        dbNotFound();
        return;
    }

    if(tableId) {
        // Double-checking that the table does indeed correspond to that db 
        if(db.tables.filter((table) => table.id == tableId).length == 0 ) {
            tableNotFound();
            return;
        }
    }
}


app.use((err: any, _: any, res: any, next: any) => {
    if (err.message && err.statusCode) {
        console.log('STATUS CODE ', err.statusCode);
        return res.status(err.statusCode).json({ message: err.message }) 
    }
    // pass the error to the default error handler
    return next(err);
});

export const server = app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
