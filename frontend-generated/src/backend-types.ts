import { valid } from 'node-html-parser';

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

    throw new Error('Invalid type');
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
            throw new Error(`${value} is not a valid integer`);
        }
        return value;
    } else  if(type == ColumnType.String) {
        return value;
    } else if(type == ColumnType.Real) {
        if (!REAL_REGEX.test(value)) {
            throw new Error(`${value} is not a valid real number`);
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
            throw new Error(`${value} is not a valid string interval`);
        }
    } else if (type == ColumnType.HtmlFile) {
        // Validating HTML file is not stricly necessary, since any test 
        // could be used to represent an HTML file.

        if(!valid(value)) {
            throw new Error(`The provided HTML is not valid`);
        }

        return value;
    } else {
        throw new Error(`We do not have validation supported for type ${type}`);
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
