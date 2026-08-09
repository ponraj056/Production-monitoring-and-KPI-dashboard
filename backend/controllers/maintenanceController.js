const pool = require('../config/db');

exports.getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ms.* 
      FROM maintenance_schedules ms
      JOIN machines m ON ms.machine_id = m.id
      WHERE m.plant_id IS NOT DISTINCT FROM $1
      ORDER BY ms.scheduled_date ASC
    `, [req.user.plant_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { machine_id, task_description, scheduled_date } = req.body;

    // Verify machine belongs to this plant
    const machineCheck = await pool.query(
      'SELECT id FROM machines WHERE id = $1 AND plant_id IS NOT DISTINCT FROM $2',
      [machine_id, req.user.plant_id]
    );
    if (machineCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid machine selected' });
    }

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

    // Verify ownership
    const check = await pool.query(`
      SELECT ms.id FROM maintenance_schedules ms
      JOIN machines m ON ms.machine_id = m.id
      WHERE ms.id = $1 AND m.plant_id IS NOT DISTINCT FROM $2
    `, [id, req.user.plant_id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const result = await pool.query(
      'UPDATE maintenance_schedules SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const check = await pool.query(`
      SELECT ms.id FROM maintenance_schedules ms
      JOIN machines m ON ms.machine_id = m.id
      WHERE ms.id = $1 AND m.plant_id IS NOT DISTINCT FROM $2
    `, [id, req.user.plant_id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const result = await pool.query('DELETE FROM maintenance_schedules WHERE id = $1 RETURNING *', [id]);
    res.json({ message: 'Schedule deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
