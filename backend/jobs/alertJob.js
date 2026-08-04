const cron = require('node-cron');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

// Set up Nodemailer for Ethereal Email (for testing)
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

async function checkAndSendAlerts() {
  try {
    const configResult = await pool.query('SELECT * FROM alerts_config LIMIT 1');
    if (configResult.rows.length === 0) return;
    const config = configResult.rows[0];

    const threshold = config.threshold_minutes;
    const emails = config.email_recipients;

    // Find machines that have been down longer than the threshold and no alert sent
    const machinesQuery = `
      SELECT * FROM machines 
      WHERE status = 'down' 
      AND alert_sent = FALSE 
      AND last_status_change < NOW() - INTERVAL '${threshold} minutes'
    `;
    const result = await pool.query(machinesQuery);
    
    for (let machine of result.rows) {
      console.log(`[ALERT] Machine ${machine.name} has been down for over ${threshold} minutes!`);
      
      // Send Email
      if (emails && transporter) {
        let message = {
          from: 'Dashboard Alerts <alerts@manufacturing.local>',
          to: emails,
          subject: `CRITICAL: Machine ${machine.name} is DOWN`,
          text: `Machine ${machine.name} has been in DOWN status for more than ${threshold} minutes. Please check the dashboard immediately.`,
          html: `<p>Machine <b>${machine.name}</b> has been in <b>DOWN</b> status for more than ${threshold} minutes.</p><p>Please check the dashboard immediately.</p>`
        };
        
        let info = await transporter.sendMail(message);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      // Mock WhatsApp
      if (config.whatsapp_recipients) {
        console.log(`[WhatsApp Mock] Sending alert to ${config.whatsapp_recipients} for Machine ${machine.name}`);
      }

      // Mark alert as sent
      await pool.query('UPDATE machines SET alert_sent = TRUE WHERE id = $1', [machine.id]);
    }
  } catch (err) {
    console.error('Error in alertJob:', err);
  }
}

// Run every minute
exports.initAlertJob = () => {
  console.log('Initializing Alert Cron Job...');
  cron.schedule('* * * * *', checkAndSendAlerts);
};
