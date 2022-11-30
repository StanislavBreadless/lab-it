import { DatabaseMeta, TableData, ColumnType, DataCell } from './backend-types';
import { BlobsApi, ColumnsApi, DbsApi, RowsApi, TableApi } from './typescript-fetch-client-generated';

const URL = 'http://localhost:8000';

const dbAPI = new DbsApi(undefined, URL);
const tableAPI = new TableApi(undefined, URL);
const columnAPI = new ColumnsApi(undefined, URL);
const rowAPI = new RowsApi(undefined, URL);
const blobAPI = new BlobsApi(undefined, URL);

export async function getListOfDbs() {
    return await dbAPI.getDB();
}

export async function createDb(name: string): Promise<string> {
    const response = await dbAPI.createDB({
        name: name
    });
    return response['id']!;
}

export async function getDbInfoByName(name: string): Promise<DatabaseMeta> {
    // @ts-ignore
    return (await dbAPI.getDB(name))[0];
}

export async function getDbInfo(dbId: string): Promise<DatabaseMeta> {
    // @ts-ignore
    return (await dbAPI.getDBById(dbId))
}

export async function changeDbName(dbId: string, newName: string) {
    await dbAPI.dbsDbIdPOST({
        name: newName
    }, dbId)
}

export async function deleteDb(dbId: string) {
    await dbAPI.dbsDbIdDELETE(dbId);
}

export async function createNewTable(dbId: string, tableName: string): Promise<string> {
    const tableId = await tableAPI.createTable({
        name: tableName
    }, dbId);

    return tableId.id!;
}

export async function getTableData(dbId: string, tableId: string): Promise<TableData> {
    const data = await tableAPI.getTableInfo(dbId, tableId);
    return data;
}

export async function editTableName(dbId: string, tableId: string, newName: string){
    await tableAPI.editTableName({
        name: newName
    }, dbId, tableId);
}

export async function deleteTable(dbId: string, tableId: string) {
    await tableAPI.deleteTable(dbId, tableId);
}

export async function addColumn(dbId: string, tableId: string, name: string, type: ColumnType): Promise<string> {
    const columnId = await columnAPI.createColumn({
        name: name,
        // @ts-ignore
        type: type
    }, dbId, tableId);

    return columnId.id!;
}

export async function editColumnName(dbId: string, tableId: string, columnId: string, newName: string) {
    await columnAPI.updateColumnName(
        { name: newName},
        dbId,
        tableId,
        columnId
    );
}

export async function deleteColumn(dbId: string, tableId: string, columnId: string) {
    await columnAPI.deleteColumn(
        dbId,
        tableId,
        columnId
    );
}

export async function addRow(dbId: string, tableId: string, rowData: DataCell[]): Promise<string> {
    // @ts-ignore
    return (await rowAPI.addRow(rowData, dbId, tableId)).id!;
}

export async function editCellData(dbId: string, tableId: string, rowId: string, colId: string, newValue: string) {
    return await rowAPI.updateCellValue(
        {
            colId,
            newValue
        },
        dbId,
        tableId,
        rowId
    );
}

export async function deleteRow(dbId: string, tableId: string, rowId: string) {
    await rowAPI.deleteRow(
        dbId,
        tableId,
        rowId
    );
}

export async function getTableIntersection(dbId: string, tableId1: string, tableId2: string): Promise<TableData> {
    // @ts-ignore
    return (await tableAPI.getTableInfo(dbId, tableId1, tableId2)).data!;
}

export async function getBlob(blob: string): Promise<string> {
    const data = await blobAPI.getBlob(blob);
    return data;
}
