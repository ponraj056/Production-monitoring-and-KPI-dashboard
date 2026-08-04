const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../config/mailer');

const isStrongPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const isAdmin = role === 'admin';
    const isApproved = !isAdmin; // Operators and supervisors are auto-approved

    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, otp, otp_expiry, is_verified, is_approved) VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7) RETURNING id, username, email, role',
      [username, email, hashedPassword, role || 'operator', otp, otpExpiry, isApproved]
    );

    const user = result.rows[0];

    // Send OTP email
    await sendMail(
      email,
      'Verify Your Account',
      `Your OTP is: ${otp}`,
      `<p>Your OTP is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );

    // If admin, send approval email to system admin
    if (isAdmin) {
      const approvalUrl = `http://localhost:5000/api/auth/approve-admin?email=${encodeURIComponent(email)}`;
      await sendMail(
        'ponrajsdr@gmail.com', // System admin email
        'New Admin Registration Approval',
        `A new admin account (${email}) is waiting for approval. Link: ${approvalUrl}`,
        `<p>A new admin account (<strong>${email}</strong>) is waiting for approval.</p><p><a href="${approvalUrl}">Click here to approve</a></p>`
      );
    }

    res.status(201).json({ message: 'Registration successful. Please verify your email with the OTP sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const result = await pool.query('SELECT id, otp, otp_expiry FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE users SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = $1', [email]);
    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [identifier]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const user = result.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Account not verified. Please verify your email.' });
    }

    if (!user.is_approved) {
      return res.status(403).json({ error: 'Account pending admin approval.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, plant_id: user.plant_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role, plant_id: user.plant_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      // Don't leak whether the email exists, just return success
      return res.json({ message: 'If the email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('UPDATE users SET otp = $1, otp_expiry = $2 WHERE email = $3', [otp, otpExpiry, email]);

    await sendMail(
      email,
      'Password Reset OTP',
      `Your password reset OTP is: ${otp}`,
      `<p>Your password reset OTP is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );

    res.json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP, and new password are required' });

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });
  }

  try {
    const result = await pool.query('SELECT id, otp, otp_expiry FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid request' });

    const user = result.rows[0];
    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, otp = NULL, otp_expiry = NULL WHERE email = $2', [hashedPassword, email]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

exports.approveAdmin = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    await pool.query('UPDATE users SET is_approved = TRUE WHERE email = $1', [email]);
    res.send(`<h1>Admin account for ${email} has been approved!</h1>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Failed to approve admin account</h1>');
  }
};

exports.switchPlant = async (req, res) => {
  try {
    const { plant_id } = req.body;
    if (!plant_id) return res.status(400).json({ error: 'plant_id is required' });

    // Ensure only super_admin can do this freely
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super_admin can switch plants' });
    }

    // Generate new token with new plant_id
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username, role: req.user.role, plant_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Plant switched successfully',
      token,
      user: { id: req.user.id, username: req.user.username, role: req.user.role, plant_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};