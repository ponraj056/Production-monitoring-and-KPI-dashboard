const pool = require('../config/db');
const { stringify } = require('csv-stringify');

exports.exportReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to date parameters' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const result = await pool.query(`
      SELECT p.id, p.machine_id, m.name as machine_name, p.units_produced, p.defective_units, p.shift, p.logged_at
      FROM production_logs p
      JOIN machines m ON p.machine_id = m.id
      WHERE p.logged_at >= $1 AND p.logged_at <= $2
      ORDER BY p.logged_at ASC
    `, [fromDate, toDate]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="production_report.csv"');

    const stringifier = stringify({
      header: true,
      columns: [
        { key: 'id', header: 'Log ID' },
        { key: 'machine_id', header: 'Machine ID' },
        { key: 'machine_name', header: 'Machine Name' },
        { key: 'units_produced', header: 'Produced' },
        { key: 'defective_units', header: 'Defects' },
        { key: 'shift', header: 'Shift' },
        { key: 'logged_at', header: 'Timestamp' }
      ]
    });

    stringifier.pipe(res);

    result.rows.forEach(row => {
      row.logged_at = new Date(row.logged_at).toLocaleString();
      stringifier.write(row);
    });

    stringifier.end();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};
