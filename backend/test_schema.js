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
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'production_logs'");
    console.log(res.rows);
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    pool.end();
  }
}
test();
