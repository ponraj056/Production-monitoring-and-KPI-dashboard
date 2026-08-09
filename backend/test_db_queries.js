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
    const res = await pool.query('SELECT id, name FROM machines ORDER BY id DESC LIMIT 1');
    const machineId = res.rows[0].id;
    console.log('Testing machine ID: ' + machineId);

    console.log('Executing production_logs query...');
    await pool.query('SELECT * FROM production_logs WHERE machine_id = $1 ORDER BY logged_at DESC', [machineId]);
    console.log('Production logs query OK');

    console.log('Executing downtime_logs query...');
    await pool.query('SELECT * FROM downtime_logs WHERE machine_id = $1 ORDER BY logged_at DESC', [machineId]);
    console.log('Downtime logs query OK');

    console.log('Executing maintenance_schedules query...');
    await pool.query('SELECT * FROM maintenance_schedules WHERE machine_id = $1 ORDER BY scheduled_date DESC', [machineId]);
    console.log('Maintenance query OK');
    
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    pool.end();
  }
}
test();
