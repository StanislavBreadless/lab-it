import { valid } from 'node-html-parser';
import sha256 from 'fast-sha256';
import { errorWithStatus } from './utils';

/// Database is a set of tables
export class DatabaseMeta {
    constructor(public id: string, public name: string, public tables: TableMetadata[]) {}
}

export enum ColumnType {
    Integer = 'Integer',
    Real = 'Real',
    Char = 'Char',
    String = 'String',
    HtmlFile = 'HtmlFile',
    StringInvl = 'StringInvl'
}

export function strToColumnType(typeStr: string): ColumnType {
    const columnType: ColumnType = (<any>ColumnType)[typeStr];

    if(columnType) {
        return columnType
    }

    errorWithStatus(`Invalid type ${typeStr}`, 400);
    throw new Error('unreachable');
}

export class ColumnMetadata {
    constructor(public id: string, public name: string, public type: ColumnType) {}
}

const NUMBER_REGEX = /^[-+]?[1-9]\d*$/;

const REAL_REGEX = /((\+|-)?([0-9]+)(\.[0-9]+)?)|((\+|-)?\.?[0-9]+)/;

// Throws an error is the type if invalid.
// Returns the value to save in the DB;
export function validateType(value: string, type: ColumnType): string {
    if(type == ColumnType.Integer) {
        if (!NUMBER_REGEX.test(value)) {
            errorWithStatus(`${value} is not a valid integer`, 400);
            throw new Error('unreachable');
        }
        return value;
    } else  if(type == ColumnType.String) {
        return value;
    } else if(type == ColumnType.Real) {
        if (!REAL_REGEX.test(value)) {
            errorWithStatus(`${value} is not a valid real number`, 400);
            throw new Error('unreachable');
        }
        return value;
    } else if(type == ColumnType.StringInvl) {
        // String interval is a JSON of triple
        // string + l + r
        // We allow supplying other fields, but these
        // will be ignored.

        const json = JSON.parse(value);
        if (json['str'] && json['l'] && json['r']) {
            return JSON.stringify({
                str: json.str,
                l: json.l,
                r: json.r
            });
        } else {
            errorWithStatus(`${value} is not a valid string interval`, 400);
            throw new Error('unreachable');
        }
    } else if (type == ColumnType.HtmlFile) {
        // Validating HTML file is not stricly necessary, since any test 
        // could be used to represent an HTML file.

        if(!valid(value)) {
            errorWithStatus(`The provided HTML is not valid`, 400);
            throw new Error('unreachable');
        }

        return value;
    } else {
        errorWithStatus(`Type ${type} is not valid`, 400);
        throw new Error('unreachable');
    }
}

export type DataCell = string|null;

/// Id is a unique id for a table, which can never be changed.
export class TableMetadata {
    constructor(public id: string, public name: string, public columns: ColumnMetadata[]) {}
}

export class RowData {
    // Warning: it is not recommended to use the constructor directly 
    constructor(public rowId: string, public data: DataCell[]) {}
}

/// Data of the table
export class TableData {
    /// A two-dimential array of stored data:
    /// one dimension is the rows
    /// the second dimention is the value in a particular column in a particular row
    data: RowData[] = [];
}

function getColumnHash(c: ColumnMetadata): string {
    let digest = new Uint8Array([
        ...sha256(new Uint8Array(Buffer.from(c.type))),
        ...new Uint8Array(Buffer.from(c.name)),
    ]); 

    return sha256(digest).toString();
}

function getRowHash(columnHashes: string[], r: RowData): string {
    const dataWithCol: string[] = [];

    // It is not possible to have a preimage of 0
    const NULL_CONST = new Uint8Array(32);
    for(let i = 0 ; i < columnHashes.length; i++) {
        const data = r.data[i];

        const dataDigest = data ? sha256(new Uint8Array(Buffer.from(data))) : NULL_CONST;

        const dataWithColBytes = new Uint8Array([
            ...new Uint8Array(Buffer.from(columnHashes[i])),
            ...dataDigest
        ]);

        dataWithCol.push(dataWithColBytes.toString());
    }

    dataWithCol.sort();

    let ans = new Uint8Array(32);

    for(let i = 0 ;i  < r.data.length; i++) {
        ans = sha256(new Uint8Array([
            ...ans,
            ...new Uint8Array(Buffer.from(dataWithCol[i]))
        ]))
    }

    return ans.toString();
}

function compareUnorderedArrays(arr1: string[], arr2: string[]): boolean {
    if(arr1.length != arr2.length) {
        return false;
    }
    const a = [...arr1].sort();
    const b = [...arr2].sort();

    for(let i = 0 ;  i < a.length; i++) {
        if(a[i] != b[i])
        return false;
    }
    return true;
}

// Finds intersection between the two tableDatas
// Note, that here we assume that the types are the same.
// (It is the responsibility of the caller to set the correct types)
export function intersection(
    data1: TableData,
    data2: TableData,
    meta1: TableMetadata,
    meta2: TableMetadata
): TableData {
    const columnHashes1 = meta1.columns.map(c => getColumnHash(c));
    const columnHashes2 = meta2.columns.map(c => getColumnHash(c));

    // types are different, there is no intersection.
    if(!compareUnorderedArrays(columnHashes1, columnHashes2)) {
        return new TableData();
    }

    const wasIn1: Set<string> = new Set();

    for(const row of data1.data) {
        wasIn1.add(getRowHash(columnHashes1, row));
    }

    const result = new TableData();

    for(const row of data2.data) {
        if(wasIn1.has(getRowHash(columnHashes2, row))) {
            result.data.push(row);
        }
    }

    return result;
}
