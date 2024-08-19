const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.USERNAME_SQL,
    password: process.env.PASSWORD_SQL,
    server:  process.env.SERVER_SQL,
    database:  process.env.DATABASE_SQL,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: 1433
};

let pool;

async function connectsql() {
    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Error connecting to SQL Server:', err);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized');
    }
    return pool;
}

module.exports = {
    connectsql,
  getPool,
  sql
};