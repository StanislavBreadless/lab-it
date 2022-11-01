

export function errorWithStatus(err: string, num: number) {
    const error = new Error(err);
    // @ts-ignore
    error['statusCode'] = num;
    throw error;
}

export function invalidRequest() {
    errorWithStatus('Invalid request', 400);
}

export function notFound(s: string) {
    errorWithStatus(s, 404);
}

export function dbNotFound() {
    notFound('DB not found');
}

export function tableNotFound() {
    notFound('Table not found');
}

export function columnNotFound() {
    notFound('Column not found');
}

export function rowNotFound() {
    notFound('Row not found');
}
