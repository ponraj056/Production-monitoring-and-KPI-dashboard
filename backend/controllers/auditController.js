const pool = require('../config/db');

exports.logAudit = async (userId, action, entityType, entityId, beforeJson, afterJson) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_json, after_json)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, beforeJson, afterJson]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.username 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
