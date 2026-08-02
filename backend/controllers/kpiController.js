const pool = require('../config/db');

const PLANNED_SHIFT_MINUTES = 480; // 8-hour shift, adjust as needed
const TARGET_OUTPUT_PER_SHIFT = 200; // ideal units per shift, adjust as needed

exports.getKpiSummary = async (req, res) => {
  try {
    const { machine_id } = req.query;

    // Build WHERE clause dynamically if machine_id is provided
    const machineFilter = machine_id ? 'WHERE machine_id = $1' : '';
    const params = machine_id ? [machine_id] : [];

    // Aggregate production data
    const productionResult = await pool.query(
      `SELECT 
        COALESCE(SUM(units_produced), 0) AS total_units,
        COALESCE(SUM(defective_units), 0) AS total_defects,
        COUNT(*) AS total_shifts
       FROM production_logs ${machineFilter}`,
      params
    );

    // Aggregate downtime data
    const downtimeResult = await pool.query(
      `SELECT COALESCE(SUM(downtime_minutes), 0) AS total_downtime
       FROM downtime_logs ${machineFilter}`,
      params
    );

    const { total_units, total_defects, total_shifts } = productionResult.rows[0];
    const { total_downtime } = downtimeResult.rows[0];

    const totalUnits = parseInt(total_units);
    const totalDefects = parseInt(total_defects);
    const totalShifts = parseInt(total_shifts);
    const totalDowntime = parseInt(total_downtime);

    const plannedTime = totalShifts * PLANNED_SHIFT_MINUTES;
    const targetOutput = totalShifts * TARGET_OUTPUT_PER_SHIFT;

    // Avoid division by zero
    const quality = totalUnits > 0 ? (totalUnits - totalDefects) / totalUnits : 0;
    const defectRate = totalUnits > 0 ? (totalDefects / totalUnits) * 100 : 0;
    const availability = plannedTime > 0 ? (plannedTime - totalDowntime) / plannedTime : 0;
    const downtimePercent = plannedTime > 0 ? (totalDowntime / plannedTime) * 100 : 0;
    const performance = targetOutput > 0 ? totalUnits / targetOutput : 0;

    const oee = availability * performance * quality;

    res.json({
      totalUnits,
      totalDefects,
      totalDowntimeMinutes: totalDowntime,
      totalShiftsLogged: totalShifts,
      availability: parseFloat((availability * 100).toFixed(2)),
      performance: parseFloat((performance * 100).toFixed(2)),
      quality: parseFloat((quality * 100).toFixed(2)),
      oee: parseFloat((oee * 100).toFixed(2)),
      downtimePercent: parseFloat(downtimePercent.toFixed(2)),
      defectRate: parseFloat(defectRate.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};