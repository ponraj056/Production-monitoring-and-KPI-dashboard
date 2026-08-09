const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'password123',
  host: 'localhost',
  port: 5432,
  database: 'production_monitor'
});

async function test() {
  try {
    const res = await pool.query('SELECT username FROM users');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
test();
