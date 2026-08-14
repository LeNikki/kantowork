var path = require('path');
var { Pool } = require('pg');
var dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

var pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT, 10) || 5433,
  user: process.env.PGUSER || process.env.POSTGRES_USER,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.PGDATABASE || process.env.POSTGRES_DB,
});

pool.on('error', function (err) {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
