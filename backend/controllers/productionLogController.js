const pool = require('../config/db');

// GET all production logs
exports.getAllLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM production_logs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single log by id
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM production_logs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new production log
exports.createLog = async (req, res) => {
  try {
    const { machine_id, units_produced, defective_units, shift } = req.body;
    const result = await pool.query(
      'INSERT INTO production_logs (machine_id, units_produced, defective_units, shift) VALUES ($1, $2, $3, $4) RETURNING *',
      [machine_id, units_produced || 0, defective_units || 0, shift]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE production log
exports.updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_id, units_produced, defective_units, shift } = req.body;
    const result = await pool.query(
      'UPDATE production_logs SET machine_id = $1, units_produced = $2, defective_units = $3, shift = $4 WHERE id = $5 RETURNING *',
      [machine_id, units_produced, defective_units, shift, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE production log
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM production_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }
    res.json({ message: 'Production log deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};