
const { writeFileSync, readFileSync, existsSync } = require('fs'); 
const { ColumnMetadata, ColumnType, DatabaseMeta, DataCell, RowData, TableData, TableMetadata, validateType,  } = require('./db');
const { v4: uuidv4 } = require('uuid');
const { loadDatabases, loadTableData, saveBlob, saveDatabases, saveTableData, deleteTableData } = require('./fs-utils');
const { columnNotFound, dbNotFound, errorWithStatus, rowNotFound, tableNotFound } =  require('./utils');

// There are three entities that are stored in the DB separately:
// 1. DB list (we have only one). It stores the list of all databases (db name + id) as well as table metadata for them.
// 2. Each DB is stored in a folder with its id. The folder contains:
//   - tables as files.
//   - blobs of data (html files) as files.
// Deleting a table DOES NOT involve deleting the associated blobs 
// (some other tables might reference the same blob of data). But deleting a DB does.

function addDb (name) {
    const dbId = uuidv4();
    const prevDbInfos = loadDatabases();
    prevDbInfos.push(new DatabaseMeta(
        dbId,
        name,
        []
    ));

    console.log(prevDbInfos);
    
    saveDatabases(prevDbInfos);
    return {
        id: dbId
    };
}
module.exports.addDb = addDb;

function changeDbName (dbId, newName) {
    const databases = loadDatabases();

    const pos = databases.findIndex(db => db.id == dbId);

    if (pos == -1) {
        errorWithStatus('Database not found', 404);
    }
    databases[pos].name = newName;

    saveDatabases(databases);
}
module.exports.changeDbName = changeDbName;

function deleteDb (id) {
    const prevDbInfos = loadDatabases();
    if(!prevDbInfos.some(db => db.id == id)) {
        dbNotFound();
    }

    saveDatabases(prevDbInfos.filter(db => db.id !== id));
}
module.exports.deleteDb = deleteDb;

function changeDBs (dbId, func) {
    const databases = loadDatabases();
        
    if (!databases.find(db => db.id == dbId)) {
        dbNotFound();
    }

    // It assumes that passing by reference will work as expected
    func(databases[databases.findIndex(db => db.id === dbId)]);

    saveDatabases(databases);
}


function changeTableMeta(dbId, tableId, func) {
    changeDBs(dbId, (db) => {
        const table = db.tables.find(t => t.id == tableId);
        if(!table) {
            dbNotFound();
            throw new Error('unreachable');
        }

        func(table);
    })
}

function addTable (dbId, tableName) {
    const tableId = uuidv4();

    changeDBs(dbId, (db) => {
        db.tables.push(new TableMetadata(tableId, tableName, []));
    });

    saveTableData(tableId, new TableData());

    return {
        id: tableId
    };
}
module.exports.addTable = addTable;

function deleteTable (dbId, tableId) {
    changeDBs(dbId, (db) => {
        if (!db.tables.find(t => t.id == tableId)) {
            tableNotFound();
        }

        db.tables = [...db.tables.filter(table => table.id !== tableId)]
    });
    deleteTableData(tableId);
}
module.exports.deleteTable = deleteTable;

function editTableMetadata(dbId, tableId, metadata) {
    changeDBs(dbId, (db) => {
        let found = false;

        for(let i = 0; i < db.tables.length; i++) {
            if (db.tables[i].id == tableId) {
                db.tables[i] = metadata;
                found = true;
            }
        }

        if(!found) {
            tableNotFound();
        }
    })
}
module.exports.editTableMetadata = editTableMetadata

function editTableName(dbId, tableId, newName) {
    changeTableMeta(dbId, tableId, (table) => {
        table.name = newName;
    });
}
module.exports.editTableName = editTableName;

function countPred(a, pred) {
    let cnt = 0;
    a.forEach(elem => {
        if(pred(elem)) cnt+=1;
    })

    return cnt;
}

function corruptDb(err) {
    errorWithStatus(`Corrupt DB: ${err}`, 500);
}

function deleteTableColumn (dbId, tableId, columnId) {
    changeTableMeta(dbId, tableId, (table) => {
        const colCount = countPred(table.columns, (c) => c.id == columnId);

        if(colCount == 0) {
            columnNotFound();
        }

        if(colCount != 1) {
            corruptDb(`${colCount} columns with id ${columnId}`);
        }

        const columnIndex = table.columns.findIndex(c => c.id === columnId);

        // Clearing up the table data.
        const tableData = loadTableData(tableId);
        for(const row of tableData.data) {
            row.data = [...row.data.filter((v, i) => i !== columnIndex)];
        }
        saveTableData(tableId, tableData);

        // Deleting the column itself:
        table.columns = [...table.columns.filter((v,i) => i !== columnIndex)];
    });
}
module.exports.deleteTableColumn = deleteTableColumn;

function addTableColumn (dbId, tableId, columnName, columnType) {
    const newColumnMeta = new ColumnMetadata(uuidv4(), columnName, columnType);

    changeTableMeta(dbId, tableId, (table) => {
        table.columns.push(newColumnMeta);

        // Clearing up the table data.
        const tableData = loadTableData(tableId);
        for(const row of tableData.data) {
            row.data.push(null);
        }
        saveTableData(tableId, tableData);
    });

    return {
        id: newColumnMeta.id
    }
}
module.exports.addTableColumn = addTableColumn;

function renameTableColumn (dbId, tableId, columnId, columnName) {
    changeTableMeta(dbId, tableId, (table) => {
        const colCount = countPred(table.columns, (c) => c.id == columnId);

        if(colCount == 0) {
            columnNotFound();
        }

        if(colCount != 1) {
            corruptDb(`${colCount} columns with id ${columnId}`);
        }

        const columnIndex = table.columns.findIndex(c => c.id === columnId);
        table.columns[columnIndex].name = columnName;
    });
}
module.exports.renameTableColumn = renameTableColumn;

function addTableRow (dbId, tableId, rowData) {
    const rowId = uuidv4();

    let row;
    changeTableMeta(dbId, tableId, (table) => {
        row = createWithTypeValidation(rowId, rowData, table.columns);
    });

    // double check
    // @ts-ignore 
    if(!row){
        errorWithStatus('Could not add a column for unknown reason', 500);
        throw new Error('unreachable');
    }
    const table = loadTableData(tableId);
    table.data.push(row);

    saveTableData(tableId, table);

    return {
        id: row.rowId
    };
}
module.exports.addTableRow = addTableRow;

function editTableRow (dbId, tableId, rowId, colId, newVal) {
    let tableColumns = [];
    changeTableMeta(dbId, tableId, (table) => {
        tableColumns = table.columns;
    });

    // double check
    // @ts-ignore 
    if(!tableColumns.length){
        errorWithStatus('Could not add a column for unknown reason', 500);
        throw new Error('unreachable');
    }

    const table = loadTableData(tableId);

    const oldRow = table.data.find((row) => row.rowId == rowId);
    if(!oldRow) {
        rowNotFound();
        throw new Error('unreachable');
    }

    const newRowData = oldRow.data.map((data, index) => {
        if(tableColumns[index].id == colId) {
            return newVal;
        } else {
            return data;
        }
    });

    const newRow = createWithTypeValidation(
        rowId,
        newRowData,
        tableColumns
    );

    table.data = table.data.map(row => {
        if(row.rowId == rowId) {
            return newRow;
        }  else {
            return row;
        }
    });

    saveTableData(tableId, table);
}
module.exports.editTableRow = editTableRow;

function deleteTableRow (dbId, tableId, rowId) {
    const table = loadTableData(tableId);
    table.data = table.data.filter(r => r.rowId !== rowId);

    saveTableData(tableId, table);
}
module.exports.deleteTableRow = deleteTableRow;

// Create, while validating all the present types there
function createWithTypeValidation(
    rowId,
    data, 
    columns
) {
    if(data.length != columns.length) {
        errorWithStatus('Number of entries down to correspond to the number of columns', 400);
    }   

    const savedData = data.map((cell, index) => {
        const type = columns[index].type;
        if(cell) {
            try {
                const valueToSave = validateType(cell, type);

                // HTML files are not directly stored in the table
                // they are stored in the form of data blobs. Each
                // data blob is assigned a unique number.
                if(type == ColumnType.HtmlFile) {
                    return saveBlob(valueToSave);
                } else {
                    return valueToSave;
                }
            } catch(e) {
                errorWithStatus(`Invalid data for column ${index}. Reason: ${e}`, 400);
                throw new Error('unreachable');
            }
        } else {
            return cell;
        }
    });

    return new RowData(rowId, savedData);
}

// All the names must contain only english me
const correctNameRegExp = /[a-zA-Z_][a-zA-Z0-9_]*/;
function validateName(name) {
    return correctNameRegExp.test(name);
}
