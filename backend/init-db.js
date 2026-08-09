const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function initDB() {
  try {
    console.log('Connecting to database...');
    
    // 1. Run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema.sql...');
    await pool.query(schema);
    console.log('Schema tables created!');

    // 2. Run migrations (which add missing columns)
    console.log('Running migrations...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(100);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;');

    // 3. Optional: Run other table migrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
      ALTER TABLE machines ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
    `);

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

initDB();
