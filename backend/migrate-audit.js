const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Starting audit migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        before_json JSONB,
        after_json JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Audit migration completed successfully!');
  } catch (err) {
    console.error('Audit migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
