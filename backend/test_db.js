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
    const id = 17;
    const plant_id = 1;
    console.log('Fetching machine details...');
    const machineResult = await pool.query('SELECT * FROM machines WHERE plant_id =  ORDER BY id DESC LIMIT 1', [plant_id]);
    if (machineResult.rows.length === 0) {
      console.log('Error: Machine not found in DB');
      return;
    }
    const testId = machineResult.rows[0].id;
    console.log('Testing machine id: ' + testId);

    console.log('Fetching production logs...');
    await pool.query('SELECT * FROM production_logs WHERE machine_id =  ORDER BY logged_at DESC', [testId]);

    console.log('Fetching downtime logs...');
    await pool.query('SELECT * FROM downtime_logs WHERE machine_id =  ORDER BY logged_at DESC', [testId]);

    console.log('Fetching maintenance schedules...');
    await pool.query('SELECT * FROM maintenance_schedules WHERE machine_id =  ORDER BY scheduled_date DESC', [testId]);
    console.log('Queries successful!');
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    pool.end();
  }
}
test();
