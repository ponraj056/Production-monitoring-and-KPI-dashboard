const pool = require('./config/db');
pool.query("INSERT INTO machines (name, status, line_id, plant_id) VALUES ('test3', 'idle', 'line1', null) RETURNING *")
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit());
