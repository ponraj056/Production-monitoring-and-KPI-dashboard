const pool = require('../config/db');

exports.getConfig = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts_config LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { threshold_minutes, email_recipients, whatsapp_recipients } = req.body;
    const result = await pool.query(
      `UPDATE alerts_config 
       SET threshold_minutes = $1, email_recipients = $2, whatsapp_recipients = $3, updated_at = NOW()
       RETURNING *`,
      [threshold_minutes, email_recipients, whatsapp_recipients]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
