const pool = require('../config/db');

exports.getLiveStats = async (req, res) => {
  try {
    // 1. Get total units produced today
    const today = new Date().toISOString().split('T')[0];
    const unitsRes = await pool.query(
      `SELECT SUM(units_produced) as total_units FROM production_logs WHERE DATE(logged_at) = $1`,
      [today]
    );
    const totalUnitsToday = parseInt(unitsRes.rows[0].total_units) || 0;

    // 2. Get active machines count
    const activeRes = await pool.query(`SELECT COUNT(*) as active_count FROM machines WHERE status = 'running'`);
    const activeMachines = parseInt(activeRes.rows[0].active_count) || 0;

    // 3. Get overall uptime (mock logic based on downtime vs expected uptime, simplified for demo)
    // In a real app, this would be total running hours / total scheduled hours.
    // For this, we'll calculate a mock percentage between 85% and 99% based on down machines.
    const allMachinesRes = await pool.query(`SELECT COUNT(*) as total FROM machines`);
    const totalMachines = parseInt(allMachinesRes.rows[0].total) || 1; // avoid division by zero
    const downRes = await pool.query(`SELECT COUNT(*) as down_count FROM machines WHERE status = 'down'`);
    const downMachines = parseInt(downRes.rows[0].down_count) || 0;
    
    // Base uptime 100%, subtract 5% for every down machine, capped at 99.9% max and 60% min.
    let uptime = 100 - ((downMachines / totalMachines) * 100);
    uptime = Math.max(60, Math.min(99.9, uptime));
    // If no machines down, add some slight random noise for realism so it doesn't just sit at 100% flat
    if (downMachines === 0) uptime = 98.5 + (Math.random() * 1.4);

    res.json({
      totalUnitsToday,
      activeMachines,
      overallUptime: parseFloat(uptime.toFixed(1))
    });
  } catch (err) {
    console.error('Failed to fetch public stats:', err);
    res.status(500).json({ error: 'Failed to fetch public stats' });
  }
};
