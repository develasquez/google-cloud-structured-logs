const Sybase = require('sybase');

const host = process.env.SYBASE_HOST;
const port = process.env.SYBASE_PORT;
const dbname = process.env.SYBASE_DATABASE;
const username = process.env.SYBASE_USER;
const password = process.env.SYBASE_PASSWORD;

const db = new Sybase(host, port, dbname, username, password, false, `${process.env.PWD}/libs/JavaSybaseLink.jar`);

const sybase = {
    getPool: () => new Promise((resolve, reject) => {
        if (!db.isConnected()) {
            db.connect(function (err) {
                if (err) {
                    console.error(err);
                    reject({ task: 'Sybase - getPool', ex: err })
                }
                resolve(true);
            });
        } else {
            resolve(true);
        }
    }),
    query: (query, params) => new Promise((resolve, reject) => {
        let q = '';
        q = query.replace('$1', params);
        sybase.getPool().then(() => {
            db.query(q, function (err, data) {
                if (err) {
                    reject({ task: 'Sybase - query', ex: err })
                }
                resolve(data);
            });
        });
    })
};

module.exports = sybase;