const pool = require('../config/db');

// GET all machines
exports.getAllMachines = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM machines ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single machine by id
exports.getMachineById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM machines WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new machine
exports.createMachine = async (req, res) => {
  try {
    const { name, status, line_id } = req.body;
    const result = await pool.query(
      'INSERT INTO machines (name, status, line_id) VALUES ($1, $2, $3) RETURNING *',
      [name, status || 'idle', line_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE machine
exports.updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, line_id } = req.body;
    const result = await pool.query(
      'UPDATE machines SET name = $1, status = $2, line_id = $3 WHERE id = $4 RETURNING *',
      [name, status, line_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE machine
exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM machines WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json({ message: 'Machine deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};