const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Starting predictions migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS machine_predictions (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER REFERENCES machines(id) UNIQUE,
        risk_score DECIMAL(5, 2) DEFAULT 0,
        risk_level VARCHAR(20) DEFAULT 'low',
        updated_at TIMESTAMP DEFAULT NOW()
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
