const pool = require('../config/db');

exports.getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_schedules ORDER BY scheduled_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { machine_id, task_description, scheduled_date } = req.body;
    const result = await pool.query(
      'INSERT INTO maintenance_schedules (machine_id, task_description, scheduled_date) VALUES ($1, $2, $3) RETURNING *',
      [machine_id, task_description, scheduled_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'pending' or 'completed'
    const result = await pool.query(
      'UPDATE maintenance_schedules SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM maintenance_schedules WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
