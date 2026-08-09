const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: 'password123', host: 'localhost', port: 5432, database: 'production_monitor' });
async function test() {
  try {
    const users = await pool.query('SELECT id, username, email, is_verified, is_approved FROM users');
    console.log(JSON.stringify(users.rows));
  } catch(e) { console.error(e.message); } finally { pool.end(); }
}
test();
