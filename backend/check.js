const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: 'password123', host: 'localhost', port: 5432, database: 'production_monitor' });
async function test() {
  try {
    const users = await pool.query('SELECT id, username, role, plant_id FROM users');
    console.log('USERS:', JSON.stringify(users.rows));
    const machines = await pool.query('SELECT id, name, plant_id FROM machines ORDER BY id DESC LIMIT 5');
    console.log('RECENT MACHINES:', JSON.stringify(machines.rows));
  } catch (err) {
    console.error(err.message);
  } finally {
    pool.end();
  }
}
test();
