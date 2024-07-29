const sql = require('mssql');

const config = {
    user: 'uipath_sql',
    password: 'TheGu@rd1an',
    server: 'CWCURDCDBP01',
    database: 'PP_WEBPORTAL',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
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