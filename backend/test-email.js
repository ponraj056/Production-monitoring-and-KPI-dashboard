require('dotenv').config();
const { sendMail } = require('./config/mailer');

async function testEmail() {
  try {
    console.log('Attempting to send test email...');
    const info = await sendMail(
      'duraisamyponraj45@gmail.com', // send to yourself
      'Test Email from ProdMonitor',
      'This is a test email.',
      '<p>This is a test email.</p>'
    );
    console.log('Success! Email sent.');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

testEmail();
