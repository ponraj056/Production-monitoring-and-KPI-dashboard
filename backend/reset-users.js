const pool = require('./config/db');

async function resetUsers() {
  try {
    console.log('Connecting to database...');
    // Delete all users except the admin user
    const result = await pool.query("DELETE FROM users WHERE username != 'admin' RETURNING *");
    console.log(`Successfully deleted ${result.rowCount} registered users.`);
    console.log('Database reset for new registrations.');
  } catch (err) {
    console.error('Failed to reset users:', err);
  } finally {
    process.exit();
  }
}

resetUsers();
