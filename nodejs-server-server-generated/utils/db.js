const { valid } = require('node-html-parser');
const sha256 = require('fast-sha256').default;
const { errorWithStatus } = require('./utils');



const ColumnType  = {
    'Integer': 'Integer',
    'Real': 'Real',
    'Char': 'Char',
    'String': 'String',
    'HtmlFile': 'HtmlFile',
    'StringInvl': 'StringInvl'
}
module.exports.ColumnType = ColumnType;

/// Database is a set of tables
module.exports.DatabaseMeta = class DatabaseMeta {
    constructor(id, name, tables) {
        this.id = id;
        this.name = name;
        this.tables = tables;
    }
}

module.exports.strToColumnType = function (typeStr) {
    const columnType = typeStr;

    if(columnType) {
        return columnType
    }

    errorWithStatus(`Invalid type ${typeStr}`, 400);
    throw new Error('unreachable');
}

module.exports.ColumnMetadata = class ColumnMetadata {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}

const NUMBER_REGEX = /^[-+]?[1-9]\d*$/;

const REAL_REGEX = /((\+|-)?([0-9]+)(\.[0-9]+)?)|((\+|-)?\.?[0-9]+)/;

// Throws an error is the type if invalid.
// Returns the value to save in the DB;
function validateType(value, type) {
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
    } else if (type == ColumnType.Char) {
        if(value.length !== 1) {
            errorWithStatus(`${value} is not a valid char`, 400);
            throw new Error('unreachable');
        }
        return value;
    } else {
        errorWithStatus(`Type ${type} is not valid`, 400);
        throw new Error('unreachable');
    }
}
module.exports.validateType = validateType;

/// Id is a unique id for a table, which can never be changed.
class TableMetadata {
    constructor(id, name, columns) {
        this.id = id;
        this.name = name;
        this.columns = columns;
    }
}
module.exports.TableMetadata = TableMetadata

class RowData {
    // Warning: it is not recommended to use the constructor directly 
    constructor(rowId, data) {
        this.rowId = rowId;
        this.data = data;
    }
}
module.exports.RowData = RowData;

/// Data of the table
class TableData {
    /// A two-dimential array of stored data:
    /// one dimension is the rows
    /// the second dimention is the value in a particular column in a particular row
    data = [];
}
module.exports.TableData = TableData;

function getColumnHash(c) {
    let digest = new Uint8Array([
        ...sha256(new Uint8Array(Buffer.from(c.type))),
        ...new Uint8Array(Buffer.from(c.name)),
    ]); 

    return sha256(digest).toString();
}

function getRowHash(columnHashes, r) {
    const dataWithCol = [];

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

function compareUnorderedArrays(arr1, arr2) {
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
function intersection(
    data1,
    data2,
    meta1,
    meta2
) {
    const columnHashes1 = meta1.columns.map(c => getColumnHash(c));
    const columnHashes2 = meta2.columns.map(c => getColumnHash(c));

    // types are different, there is no intersection.
    if(!compareUnorderedArrays(columnHashes1, columnHashes2)) {
        return new TableData();
    }

    const wasIn1 = new Set();

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
module.exports.intersection = intersection;
