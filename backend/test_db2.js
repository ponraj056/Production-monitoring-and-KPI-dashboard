const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'password123',
  host: 'localhost',
  port: 5432,
  database: 'production_monitor'
});
const { getTimeFilter } = require('./utils/dateFilter');

async function test() {
  try {
    const id = 17;
    const plant_id = 1;
    const timeRange = 'all';
    const dateFilterStr = getTimeFilter(timeRange, true);

    console.log('Query: ', SELECT * FROM production_logs WHERE machine_id =   ORDER BY logged_at DESC);
    
    await pool.query(
      SELECT * FROM production_logs WHERE machine_id =   ORDER BY logged_at DESC, 
      [id]
    );

    console.log('Queries successful!');
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    pool.end();
  }
}
test();
