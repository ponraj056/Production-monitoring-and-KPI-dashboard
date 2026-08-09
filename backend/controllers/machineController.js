const pool = require('../config/db');
const { getTimeFilter } = require('../utils/dateFilter');
const { logAudit } = require('./auditController');

// GET all machines
exports.getAllMachines = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM machines WHERE plant_id IS NOT DISTINCT FROM $1 ORDER BY id',
      [req.user.plant_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single machine by id
exports.getMachineById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM machines WHERE id = $1 AND plant_id IS NOT DISTINCT FROM $2',
      [id, req.user.plant_id]
    );
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
    console.log(`getMachineStats invoked for id=${id}, plant_id=${req.user.plant_id}, timeRange=${timeRange}`);
    const machineResult = await pool.query(
      'SELECT * FROM machines WHERE id = $1 AND plant_id IS NOT DISTINCT FROM $2',
      [id, req.user.plant_id]
    );
    if (machineResult.rows.length === 0) {
      console.log(`Machine not found: id=${id}, plant_id=${req.user.plant_id}`);
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

    // 4. Fetch maintenance schedules
    const maintenanceResult = await pool.query(
      `SELECT * FROM maintenance_schedules WHERE machine_id = $1 ORDER BY scheduled_date DESC`,
      [id]
    );
    const maintenanceLogs = maintenanceResult.rows;

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
      downtimeLogs,
      maintenanceLogs
    });
  } catch (err) {
    console.error('getMachineStats ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE new machine
exports.createMachine = async (req, res) => {
  try {
    const { name, status, line_id } = req.body;
    const result = await pool.query(
      'INSERT INTO machines (name, status, line_id, plant_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, status || 'idle', line_id, req.user.plant_id]
    );

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    io.emit('machineCreated', result.rows[0]);

    if (req.user) {
      await logAudit(req.user.id, 'CREATE', 'machine', result.rows[0].id, null, result.rows[0]);
    }

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
    
    // Get before state
    const beforeRes = await pool.query('SELECT * FROM machines WHERE id = $1', [id]);
    const beforeState = beforeRes.rows.length > 0 ? beforeRes.rows[0] : null;

    const result = await pool.query(
      `UPDATE machines 
       SET name = $1, 
           status = $2, 
           line_id = $3,
           last_status_change = CASE WHEN status != $2 THEN NOW() ELSE last_status_change END,
           alert_sent = CASE WHEN status != $2 THEN FALSE ELSE alert_sent END
       WHERE id = $4 AND plant_id IS NOT DISTINCT FROM $5 RETURNING *`,
      [name, status, line_id, id, req.user.plant_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('machineUpdated', result.rows[0]);

    if (req.user && beforeState) {
      await logAudit(req.user.id, 'UPDATE', 'machine', id, beforeState, result.rows[0]);
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

    const beforeRes = await pool.query(
      'SELECT * FROM machines WHERE id = $1 AND plant_id IS NOT DISTINCT FROM $2',
      [id, req.user.plant_id]
    );
    const beforeState = beforeRes.rows.length > 0 ? beforeRes.rows[0] : null;

    if (!beforeState) return res.status(404).json({ error: 'Machine not found' });

    const result = await pool.query(
      'DELETE FROM machines WHERE id = $1 AND plant_id IS NOT DISTINCT FROM $2 RETURNING *',
      [id, req.user.plant_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    if (req.user && beforeState) {
      await logAudit(req.user.id, 'DELETE', 'machine', id, beforeState, null);
    }

    res.json({ message: 'Machine deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};