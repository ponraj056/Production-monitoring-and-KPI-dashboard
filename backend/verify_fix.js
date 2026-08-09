const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: 'password123', host: 'localhost', port: 5432, database: 'production_monitor' });
async function test() {
  try {
    // Simulate query for ponraj (plant_id = null)
    const plant_id = null;
    
    // Old query - fails for null
    const old = await pool.query('SELECT COUNT(*) as cnt FROM machines WHERE plant_id = ', [plant_id]);
    console.log('OLD query (= null) count:', old.rows[0].cnt);
    
    // New query - works for null  
    const newQ = await pool.query('SELECT COUNT(*) as cnt FROM machines WHERE plant_id IS NOT DISTINCT FROM ', [plant_id]);
    console.log('NEW query (IS NOT DISTINCT FROM null) count:', newQ.rows[0].cnt);

    // Stats test for latest machine with null plant_id
    const m = await pool.query('SELECT id, name, plant_id FROM machines WHERE plant_id IS NOT DISTINCT FROM  ORDER BY id DESC LIMIT 1', [plant_id]);
    if (m.rows.length > 0) {
      console.log('Machine found:', m.rows[0].id, m.rows[0].name);
      
      const stats = await pool.query('SELECT * FROM maintenance_schedules WHERE machine_id = ', [m.rows[0].id]);
      console.log('Maintenance schedules for machine:', stats.rows.length, 'records');
    }
  } catch(e) { console.error(e.message); } finally { pool.end(); }
}
test();
