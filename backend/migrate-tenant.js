const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function migrate() {
  try {
    console.log('Starting multi-tenant migration...');
    
    // 1. Create plants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Insert default plants
    const checkPlants = await pool.query('SELECT COUNT(*) FROM plants');
    if (parseInt(checkPlants.rows[0].count) === 0) {
      await pool.query("INSERT INTO plants (name, location) VALUES ('Plant Alpha', 'New York'), ('Plant Beta', 'London')");
    }

    // Get Plant Alpha ID
    const alphaRes = await pool.query("SELECT id FROM plants WHERE name = 'Plant Alpha'");
    const alphaId = alphaRes.rows[0].id;

    // 3. Add plant_id to users, machines, production_logs, downtime_logs
    const tables = ['users', 'machines', 'production_logs', 'downtime_logs'];
    
    for (let table of tables) {
      await pool.query(`
        ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS plant_id INTEGER REFERENCES plants(id);
      `);

      // Set default plant_id to existing rows
      await pool.query(`
        UPDATE ${table} SET plant_id = $1 WHERE plant_id IS NULL;
      `, [alphaId]);
    }

    // Ensure admin user exists
    const adminCheck = await pool.query("SELECT id FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
      console.log('Creating default admin user...');
      const hashed = await bcrypt.hash('admin123', 10);
      await pool.query(
        "INSERT INTO users (username, password, role, is_approved, is_verified, plant_id) VALUES ($1, $2, 'super_admin', TRUE, TRUE, $3)",
        ['admin', hashed, alphaId]
      );
    } else {
      // make existing admin super_admin
      await pool.query("UPDATE users SET role = 'super_admin' WHERE username = 'admin'");
    }

    console.log('Multi-tenant migration completed successfully!');
  } catch (err) {
    console.error('Multi-tenant migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
