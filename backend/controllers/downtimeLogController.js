const pool = require('../config/db');
const { getTimeFilter } = require('../utils/dateFilter');

// GET all downtime logs
exports.getAllDowntimeLogs = async (req, res) => {
  try {
    const { timeRange } = req.query;
    let dateFilterStr = getTimeFilter(timeRange, true);
    const result = await pool.query(
      `SELECT * FROM downtime_logs WHERE plant_id IS NOT DISTINCT FROM $1 ${dateFilterStr} ORDER BY logged_at DESC`,
      [req.user.plant_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET single downtime log by id
exports.getDowntimeLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM downtime_logs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new downtime log
exports.createDowntimeLog = async (req, res) => {
  try {
    const { machine_id, reason, downtime_minutes } = req.body;
    const result = await pool.query(
      'INSERT INTO downtime_logs (machine_id, reason, downtime_minutes) VALUES ($1, $2, $3) RETURNING *',
      [machine_id, reason, downtime_minutes || 0]
    );
    if (req.app.get('io')) {
      req.app.get('io').emit('dashboardUpdate', { source: 'manual', type: 'downtime_log', log: result.rows[0] });
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE downtime log
exports.updateDowntimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_id, reason, downtime_minutes } = req.body;
    const result = await pool.query(
      'UPDATE downtime_logs SET machine_id = $1, reason = $2, downtime_minutes = $3 WHERE id = $4 RETURNING *',
      [machine_id, reason, downtime_minutes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE downtime log
exports.deleteDowntimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM downtime_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Downtime log not found' });
    }
    if (req.app.get('io')) {
      req.app.get('io').emit('dashboardUpdate', { source: 'manual', type: 'downtime_log_delete', deleted: result.rows[0] });
    }
    res.json({ message: 'Downtime log deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};