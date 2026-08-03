const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Starting maintenance schedules migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_schedules (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER REFERENCES machines(id),
        task_description VARCHAR(255) NOT NULL,
        scheduled_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
