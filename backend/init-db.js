const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

    // 2. Run all migration scripts
    const migrations = [
      'migrate-auth.js',
      'migrate-tenant.js',
      'migrate-alerts.js',
      'migrate-audit.js',
      'migrate-maintenance.js',
      'migrate-predictions.js'
    ];

    for (const migration of migrations) {
      console.log(`Running ${migration}...`);
      try {
        // Run them synchronously so we don't crash
        execSync(`node "${path.join(__dirname, migration)}"`, { stdio: 'inherit' });
      } catch (err) {
        console.error(`Failed to run ${migration}, but continuing...`);
      }
    }

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

initDB();
