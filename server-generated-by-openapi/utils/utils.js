

const writer = require('./writer');

function errorWithStatus(err, num) {

    const payload = writer.respondWithCode(num, err);
    // const error = new Error(err);
    // // @ts-ignore
    // error['statusCode'] = num;
    throw payload;
}
module.exports.errorWithStatus = errorWithStatus;

function invalidRequest() {
    errorWithStatus('Invalid request', 400);
}
module.exports.invalidRequest = invalidRequest;

function notFound(s) {
    errorWithStatus(s, 404);
}
module.exports.notFound = notFound;

function dbNotFound() {
    notFound('DB not found');
}
module.exports.dbNotFound = dbNotFound;

function tableNotFound() {
    notFound('Table not found');
}
module.exports.tableNotFound = tableNotFound;

function columnNotFound() {
    notFound('Column not found');
}
module.exports.columnNotFound = columnNotFound;

function rowNotFound() {
    notFound('Row not found');
}
module.exports.rowNotFound = rowNotFound;
