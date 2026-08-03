const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Starting auth migration...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(100);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;');
    
    // Optionally backfill existing users to be verified and approved so they can login
    await pool.query("UPDATE users SET is_verified = TRUE, is_approved = TRUE WHERE email IS NULL;");

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
