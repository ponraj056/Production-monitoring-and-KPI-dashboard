const pool = require('./config/db');

async function checkDB() {
  try {
    const userRes = await pool.query('SELECT id, username, email, plant_id FROM users');
    console.log('USERS:', userRes.rows);

    const machinesRes = await pool.query('SELECT * FROM machines');
    console.log('MACHINES:', machinesRes.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDB();
