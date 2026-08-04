const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Starting alerts migration...');
    
    // 1. Create alerts_config table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts_config (
        id SERIAL PRIMARY KEY,
        threshold_minutes INTEGER DEFAULT 10,
        email_recipients VARCHAR(255) DEFAULT '',
        whatsapp_recipients VARCHAR(255) DEFAULT '',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Insert default config if empty
    const checkConfig = await pool.query('SELECT COUNT(*) FROM alerts_config');
    if (parseInt(checkConfig.rows[0].count) === 0) {
      await pool.query('INSERT INTO alerts_config (threshold_minutes) VALUES (10)');
    }

    // 2. Add columns to machines table if they don't exist
    await pool.query(`
      ALTER TABLE machines 
      ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT FALSE;
    `);

    // Initialize existing machines' last_status_change if null
    await pool.query(`
      UPDATE machines SET last_status_change = NOW() WHERE last_status_change IS NULL;
    `);

    console.log('Alerts migration completed successfully!');
  } catch (err) {
    console.error('Alerts migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
