const pool = require('../config/db');

// Calculate risk based on heuristics
const calculateRisk = async () => {
  try {
    const machinesRes = await pool.query('SELECT id, created_at FROM machines');
    const machines = machinesRes.rows;

    for (const machine of machines) {
      let riskScore = 5; // base risk

      // 1. Time since last downtime
      const lastDowntimeRes = await pool.query(
        'SELECT logged_at FROM downtime_logs WHERE machine_id = $1 ORDER BY logged_at DESC LIMIT 1',
        [machine.id]
      );
      
      const lastActionDate = lastDowntimeRes.rows.length > 0 
        ? new Date(lastDowntimeRes.rows[0].logged_at) 
        : new Date(machine.created_at);
        
      const minutesSinceAction = (new Date() - lastActionDate) / (1000 * 60);
      
      // Add 0.5% risk for every minute running (demo scaling)
      riskScore += (minutesSinceAction * 0.5);

      // 2. Defect rate in last 24 hours
      const prodRes = await pool.query(
        `SELECT SUM(units_produced) as total_units, SUM(defective_units) as total_defects 
         FROM production_logs 
         WHERE machine_id = $1 AND logged_at >= NOW() - INTERVAL '24 hours'`,
        [machine.id]
      );
      
      if (prodRes.rows[0].total_units > 0) {
        const defectRate = (prodRes.rows[0].total_defects / prodRes.rows[0].total_units) * 100;
        if (defectRate > 20) riskScore += 50;
        else if (defectRate > 10) riskScore += 30;
        else if (defectRate > 5) riskScore += 15;
      }

      // Clamp between 0 and 100
      riskScore = Math.min(Math.max(riskScore, 0), 100);
      
      let riskLevel = 'low';
      if (riskScore >= 70) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';

      // Upsert into predictions
      await pool.query(`
        INSERT INTO machine_predictions (machine_id, risk_score, risk_level, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (machine_id) 
        DO UPDATE SET risk_score = $2, risk_level = $3, updated_at = NOW()
      `, [machine.id, riskScore, riskLevel]);
    }
  } catch (error) {
    console.error('Error calculating predictions:', error);
  }
};

exports.initPredictionsJob = (io) => {
  console.log('Prediction job initialized');
  // Run immediately
  calculateRisk();
  // Run every 1 minute
  setInterval(async () => {
    await calculateRisk();
    // Emit event so dashboard knows to fetch new risks
    if (io) {
      io.emit('predictionsUpdated');
    }
  }, 60 * 1000);
};

exports.getDowntimeRisk = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, m.name as machine_name 
      FROM machine_predictions p
      JOIN machines m ON p.machine_id = m.id
      ORDER BY p.risk_score DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
