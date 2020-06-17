const { Pool } = require('pg');
const fs = require('fs');
const PATH_CERTS='ssl';
const SERVICE_ACCOUNT_NAME='cdc';

var config = process.env.ENV==='DEV'? {} : {
    ssl: {
        ca: fs.readFileSync(`${PATH_CERTS}/ca.crt`)
            .toString(),
        key: fs.readFileSync(`${PATH_CERTS}/client.${SERVICE_ACCOUNT_NAME}.key`)
            .toString(),
        cert: fs.readFileSync(`${PATH_CERTS}/client.${SERVICE_ACCOUNT_NAME}.crt`)
            .toString()
    }
};

const pool = new Pool(config);


const cockroack = {
    getPool: () => new Promise((resolve, reject) => {
        pool.connect((err, client, release) => {
            if (err) {
                console.error(err);
                reject({task: 'Cockroach - getPool', ex: err })
            }
            resolve({
                client,
                release
            });
        })
    }),
    query: (client, query, params) => new Promise((resolve, reject) => {
        client.query(query, params || [], (err, result) => {
            if (err) {
                console.error(err, query, params);
                reject({task: 'Cockroach - query', ex: err });
                return;
            }
            resolve(result.rows);
        });
    }),
    transaction: (client, queryText, params) => new Promise((resolve, reject) => {
        ; (async () => {
            try {
                await client.query('BEGIN');
                const res = await client.query(queryText, params);
                await client.query('COMMIT');
                resolve(res);
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release()
            }
        })().catch(reject)
    })
};

module.exports = cockroack;