
import { writeFileSync, readFileSync, existsSync } from 'fs'; 
import { ColumnMetadata, ColumnType, DatabaseMeta, DataCell, RowData, TableData, TableMetadata, validateType,  } from './db';
import { v4 as uuidv4 } from 'uuid';
import { loadDatabases, loadTableData, saveBlob, saveDatabases, saveTableData, deleteTableData } from './fs-utils';
import { table } from 'console';

export * from './fs-utils';

// There are three entities that are stored in the DB separately:
// 1. DB list (we have only one). It stores the list of all databases (db name + id) as well as table metadata for them.
// 2. Each DB is stored in a folder with its id. The folder contains:
//   - tables as files.
//   - blobs of data (html files) as files.
// Deleting a table DOES NOT involve deleting the associated blobs 
// (some other tables might reference the same blob of data). But deleting a DB does.


export function addDb(name: string): IdResponse {
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

export function changeDbName(dbId: string, newName: string) {
    const databases = loadDatabases();

    const pos = databases.findIndex(db => db.id == dbId);

    if (pos == -1) {
        throw new Error('Database not found');
    }
    databases[pos].name = newName;

    saveDatabases(databases);
}

export function deleteDb(id: string) {
    const prevDbInfos = loadDatabases();
    if(!prevDbInfos.some(db => db.id == id)) {
        throw new Error('Not found')
    }

    saveDatabases(prevDbInfos.filter(db => db.id !== id));
}

function changeDBs(dbId: string, func: (db: DatabaseMeta) => void) {
    const databases = loadDatabases();
        
    if (!databases.find(db => db.id == dbId)) {
        throw new Error('Database not found');
    }

    // It assumes that passing by reference will work as expected
    func(databases[databases.findIndex(db => db.id === dbId)]);

    saveDatabases(databases);
}


function changeTableMeta(dbId: string, tableId: string, func: (table: TableMetadata) => void) {
    changeDBs(dbId, (db) => {
        const table = db.tables.find(t => t.id == tableId);
        if(!table) {
            throw new Error('Table not found');
        }

        func(table);
    })
}

export function addTable(dbId: string, tableName: string): IdResponse {
    const tableId = uuidv4();

    changeDBs(dbId, (db) => {
        db.tables.push(new TableMetadata(tableId, tableName, []));
    });

    saveTableData(tableId, new TableData());

    return {
        id: tableId
    };
}

export function deleteTable(dbId: string, tableId: string) {
    changeDBs(dbId, (db) => {
        if (!db.tables.find(t => t.id == tableId)) {
            throw new Error('Table not found');
        }

        db.tables = [...db.tables.filter(table => table.id !== tableId)]
    });
    deleteTableData(tableId);
}

export function editTableMetadata(dbId: string, tableId: string, metadata: TableMetadata) {
    changeDBs(dbId, (db) => {
        let found = false;

        for(let i = 0; i < db.tables.length; i++) {
            if (db.tables[i].id == tableId) {
                db.tables[i] = metadata;
                found = true;
            }
        }

        if(!found) {
            throw new Error('Table not found');
        }
    })
}

export function editTableName(dbId: string, tableId: string, newName: string) {
    changeTableMeta(dbId, tableId, (table) => {
        table.name = newName;
    });
}

function countPred<X>(a: Array<X>, pred: (x: X)=>boolean): number {
    let cnt = 0;
    a.forEach(elem => {
        if(pred(elem)) cnt+=1;
    })

    return cnt;
}

function corruptDb(err: string) {
    throw new Error(`Corrupt DB: ${err}`);
}

function notFound() {
    throw new Error('Not found');
}

export function deleteTableColumn(dbId: string, tableId: string, columnId: string) {
    changeTableMeta(dbId, tableId, (table) => {
        const colCount = countPred(table.columns, (c) => c.id == columnId);

        if(colCount == 0) {
            notFound();
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

        // Deleting the column itself:
        table.columns = [...table.columns.filter((v,i) => i !== columnIndex)];
    });
}

export function addTableColumn(dbId: string, tableId: string, columnName: string, columnType: ColumnType): IdResponse {
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

export function renameTableColumn(dbId: string, tableId: string, columnId: string, columnName: string) {
    changeTableMeta(dbId, tableId, (table) => {
        const colCount = countPred(table.columns, (c) => c.id == columnId);

        if(colCount == 0) {
            notFound();
        }

        if(colCount != 1) {
            corruptDb(`${colCount} columns with id ${columnId}`);
        }

        const columnIndex = table.columns.findIndex(c => c.id === columnId);
        table.columns[columnIndex].name = columnName;
    });
}

export function addTableRow(dbId: string, tableId: string, rowData: DataCell[]): IdResponse {
    const rowId = uuidv4();

    let row: RowData;
    changeTableMeta(dbId, tableId, (table) => {
        row = createWithTypeValidation(rowId, rowData, table.columns);
    });

    // double check
    // @ts-ignore 
    if(!row){
        throw new Error('Could not add a column for unknown reason');
    }
    const table = loadTableData(tableId);
    table.data.push(row);

    console.log('DDDDDD')
    saveTableData(tableId, table);
    console.log('HHHHHH')

    return {
        id: row.rowId
    };
}

export function editTableRow(dbId: string, tableId: string, rowId: string, colId: string, newVal: string) {
    let tableColumns: ColumnMetadata[] = [];
    changeTableMeta(dbId, tableId, (table) => {
        tableColumns = table.columns;
    });

    // double check
    // @ts-ignore 
    if(!tableColumns.length){
        throw new Error('Could not add a column for unknown reason');
    }

    const table = loadTableData(tableId);

    const oldRow = table.data.find((row) => row.rowId == rowId);
    if(!oldRow) {
        throw new Error('row not found');
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

export function deleteTableRow(dbId: string, tableId: string, rowId: string) {
    const table = loadTableData(tableId);
    table.data = table.data.filter(r => r.rowId !== rowId);

    saveTableData(tableId, table);
}

// Create, while validating all the present types there
function createWithTypeValidation(
    rowId: string,
    data: DataCell[], 
    columns: ColumnMetadata[]
): RowData {
    if(data.length != columns.length) {
        throw new Error('Number of entries down to correspond to the number of columns')
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
                throw new Error(`Invalid data for column ${index}. Reason: ${e}`)
            }
        } else {
            return cell;
        }
    });

    return new RowData(rowId, savedData);
}

// All the names must contain only english me
const correctNameRegExp = /[a-zA-Z_][a-zA-Z0-9_]*/;
function validateName(name: string) {
    return correctNameRegExp.test(name);
}
