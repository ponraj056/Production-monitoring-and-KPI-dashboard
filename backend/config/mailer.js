const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = async () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Using Ethereal Email for testing...');
    console.log('Ethereal User:', testAccount.user);
    
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

let transporterPromise = createTransporter();

const sendMail = async (to, subject, text, html) => {
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER ? `"ProdMonitor" <${process.env.SMTP_USER}>` : '"ProdMonitor" <noreply@prodmonitor.example.com>',
      to,
      subject,
      text,
      html
    });
    console.log("Message sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendMail };
