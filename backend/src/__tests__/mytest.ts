import request from 'supertest'
import {Express} from 'express-serve-static-core'
import { v4 as uuidv4 } from 'uuid';

import { server } from '../index';

// let server: Express

// beforeAll(async () => {
//   server = app;
// })

afterAll(() => {
    server.close();
})

function randomName() {
    const name = uuidv4();
    return name.split('').filter(s => s !== '-').join('');
}

describe('Basic db flow', () => {
    // The simplest way to random db name
    const newDbName = randomName();
    const table1Name = 't1';
    const table2Name = 't2';
    const column1Name = 'c1';
    const column2Name = 'c2';
    const column1Type = 'Real';
    const column2Type = 'StringInvl';

    let dbId: string;
    let table1Id: string;
    let table2Id: string;

    function expect200(res: any, done: any): boolean {
        try {
            expect(res.status).toBe(200);
            return true;
        } catch(e) {
            console.log('err body: ', res.body);
            done(e);
            return false;
        }
    }

    it('Should create DB', done => {
        request(server)
        .post(`/dbs`)
        .send({ name: newDbName })
        .set('Accept', 'application/json')     
        .expect('Content-Type', /json/)
        .end((_, res) => {
            if(!expect200(res, done)) {
                return;
            }

            dbId = res.body.id;
            console.log('dbId: ', dbId);
            done()
        })
    })

    it('Should create table1', done => {
        request(server)
            .post(`/dbs/${dbId}/tables`)
            .send({ name: table1Name })
            .set('Accept', 'application/json')     
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(!expect200(res, done)) {
                    return;
                }

                table1Id = res.body.id;
                console.log('table1Id', table1Id);
                done();
            })
    })

    it('Should create table2', done => {
        request(server)
            .post(`/dbs/${dbId}/tables`)
            .send({ name: table2Name })
            .set('Accept', 'application/json')     
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(!expect200(res, done)) {
                    return;
                }

                table2Id = res.body.id;
                console.log('table2Id', table2Id);
                done()
            })
    })

    function addColumn(
        tableId: string,
        columnName: string,
        columnType: string,
        done: any 
    ) {
        request(server)
            .post(`/dbs/${dbId}/tables/${tableId}/columns`)
            .send({ name: columnName, type: columnType })
            .set('Accept', 'application/json')     
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(!expect200(res, done)) {
                    return;
                }
                done()
            })
    }

    function addRow(
        tableId: string,
        values: any[],
        done: any 
    ) {
        request(server)
            .post(`/dbs/${dbId}/tables/${tableId}/rows`)
            .send(values)
            .set('Accept', 'application/json')     
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(!expect200(res, done)) {
                    return;
                }

                done()
            })
    }

    it('Should add first column to table1', done => {
        addColumn(table1Id, column1Name, column1Type, done);
    })

    it('Should add second column to table1', done => {
        addColumn(table1Id, column2Name, column2Type, done);
    })

    it('Should add first column to table2', done => {
        addColumn(table2Id, column1Name, column1Type, done);
    })

    it('Should add second column to table2', done => {
        addColumn(table2Id, column2Name, column2Type, done);
    })

    it('Should add first row to table1', done => {
        addRow(table1Id, ['12.3', '{ "str": "abc", "l": "1", "r": "2" }'], done);
    })
    it('Should add second row to table1', done => {
        addRow(table1Id, ['1.5', '{ "str": "abc", "l": "0", "r": "2" }'], done);
    })

    it('Should add first row to table2 ', done => {
        addRow(table2Id, ['1.5', '{ "str": "abc", "l": "0", "r": "2" }'], done);
    })
    it('Should add second row to table2 ', done => {
        addRow(table2Id, ['12.3', '{ "str": "abcd", "l": "1", "r": "2" }'], done);
    })

    it('Should find the correct intersection', done => {
        request(server)
            .get(`/dbs/${dbId}/tables/${table1Id}?intersection=${table2Id}`)
            .set('Accept', 'application/json')     
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(!expect200(res, done)) {
                    return;
                }

                const intersectionData = res.body.data;

                try {
                    expect(intersectionData.length).toBe(1);
                    const rowData = intersectionData[0].data;
                    expect(rowData.length).toBe(2);
                    expect(rowData[0]).toBe('1.5');

                    const strInv = JSON.parse(rowData[1]);

                    expect(strInv.l).toBe('0');
                    expect(strInv.r).toBe('2');
                    expect(strInv.str).toBe('abc');
                } catch(e){
                    done(e);
                    return;
                }

                done()
            })
    });
})
