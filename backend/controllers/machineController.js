const pool = require('../config/db');
const { getTimeFilter } = require('../utils/dateFilter');

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

// GET single machine with full stats
exports.getMachineStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange } = req.query;
    const dateFilterStr = getTimeFilter(timeRange, true);

    // 1. Fetch machine details
    const machineResult = await pool.query('SELECT * FROM machines WHERE id = $1', [id]);
    if (machineResult.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    const machine = machineResult.rows[0];

    // 2. Fetch production logs
    const productionResult = await pool.query(
      `SELECT * FROM production_logs WHERE machine_id = $1 ${dateFilterStr} ORDER BY logged_at DESC`, 
      [id]
    );
    const productionLogs = productionResult.rows;

    let totalUnits = 0;
    let totalDefects = 0;
    productionLogs.forEach(log => {
      totalUnits += log.units_produced;
      totalDefects += log.defective_units;
    });

    // 3. Fetch downtime logs
    const downtimeResult = await pool.query(
      `SELECT * FROM downtime_logs WHERE machine_id = $1 ${dateFilterStr} ORDER BY logged_at DESC`, 
      [id]
    );
    const downtimeLogs = downtimeResult.rows;

    let totalDowntime = 0;
    downtimeLogs.forEach(log => {
      totalDowntime += log.downtime_minutes;
    });

    const defectRate = totalUnits > 0 ? ((totalDefects / totalUnits) * 100).toFixed(1) : 0;
    const availability = Math.max(0, 100 - (totalDowntime / 480 * 100)); 
    const quality = totalUnits > 0 ? ((totalUnits - totalDefects) / totalUnits * 100) : 0;
    const oee = Math.round((availability * quality) / 100) || 0;
    const healthScore = Math.round((0.4 * oee) + (0.3 * availability) + (0.3 * (100 - defectRate)));

    res.json({
      machine,
      kpis: {
        oee,
        downtime: totalDowntime, // specific to machine
        defectRate,
        throughput: totalUnits,
        healthScore
      },
      productionLogs,
      downtimeLogs
    });
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

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    io.emit('machineCreated', result.rows[0]);

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
      `UPDATE machines 
       SET name = $1, 
           status = $2, 
           line_id = $3,
           last_status_change = CASE WHEN status != $2 THEN NOW() ELSE last_status_change END,
           alert_sent = CASE WHEN status != $2 THEN FALSE ELSE alert_sent END
       WHERE id = $4 RETURNING *`,
      [name, status, line_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('machineUpdated', result.rows[0]);

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