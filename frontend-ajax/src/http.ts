import { DatabaseMeta, TableData, ColumnType, DataCell } from './backend-types';

const URL = 'http://localhost:8000';


export function fetchEndpoint(
    endpoint: string,
    method?: string,
    body?: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method || 'GET', `${URL}/${endpoint}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
        if(body) {
            console.log(body);
            xhr.send(JSON.stringify(body));
        } else {
            xhr.send();
        }
        xhr.onload = function() {
            if(xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response)
            } else {
                console.log(xhr.response);
                reject(xhr.response);
            }
        }
        xhr.onerror = function() {
            reject(xhr.response);
        }
        xhr.ontimeout = function() {
            reject('Timeout');
        }
    });
}

export async function getListOfDbs() {
    return await fetchEndpoint(`dbs`);
}

export async function createDb(name: string): Promise<string> {
    const response = await fetchEndpoint(`dbs`, 'POST', {
        name
    })
    return response['id'];
}

export async function getDbInfoByName(name: string): Promise<DatabaseMeta> {
    return await fetchEndpoint(`dbs?name=${name}`);
}

export async function getDbInfo(dbId: string): Promise<DatabaseMeta> {
    return await fetchEndpoint(`dbs/${dbId}`);
}

export async function changeDbName(dbId: string, newName: string) {
    await fetchEndpoint(`dbs/${dbId}`, 'POST', {
        name: newName
    });
}

export async function deleteDb(dbId: string) {
    await fetchEndpoint(`dbs/${dbId}`, 'DELETE');
}

export async function createNewTable(dbId: string, tableName: string): Promise<string> {
    const tableId = await fetchEndpoint(`dbs/${dbId}/tables`, 'POST', {
        name: tableName
    })

    return tableId;
}

export async function getTableData(dbId: string, tableId: string): Promise<TableData> {
    const data = await fetchEndpoint(`dbs/${dbId}/tables/${tableId}`);
    return data;
}

export async function editTableName(dbId: string, tableId: string, newName: string){
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}`, 'POST', {
        name: newName
    });
}

export async function deleteTable(dbId: string, tableId: string) {
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}`, 'DELETE');
}

export async function addColumn(dbId: string, tableId: string, name: string, type: ColumnType): Promise<string> {
    const columnId = await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/columns`, 'POST', {
        name,
        type
    });

    return columnId;
}

export async function editColumnName(dbId: string, tableId: string, columnId: string, newName: string) {
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/columns/${columnId}`, 'POST', {
        name: newName
    })
}

export async function deleteColumn(dbId: string, tableId: string, columnId: string) {
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/columns/${columnId}`, 'DELETE');
}

export async function addRow(dbId: string, tableId: string, rowData: DataCell[]): Promise<string> {
    const rowId = await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/rows`, 'POST', rowData);

    return rowId;
}

export async function editCellData(dbId: string, tableId: string, rowId: string, colId: string, newValue: string) {
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/rows/${rowId}`, 'POST', {
        colId,
        newValue
    });
}

export async function deleteRow(dbId: string, tableId: string, rowId: string) {
    await fetchEndpoint(`dbs/${dbId}/tables/${tableId}/rows/${rowId}`, 'DELETE');
}

export async function getTableIntersection(dbId: string, tableId1: string, tableId2: string): Promise<TableData> {
    const data = await fetchEndpoint(`dbs/${dbId}/tables/${tableId1}?intersection=${tableId2}`);
    return data;
}

export async function getBlob(blob: string): Promise<string> {
    const data = await fetchEndpoint(`blobs/${blob}`);
    return data.data;
}
