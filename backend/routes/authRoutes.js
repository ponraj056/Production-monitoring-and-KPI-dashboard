const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireRole } = require('../middleware/roleCheck');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/approve-admin', authController.approveAdmin);
router.post('/switch-plant', requireRole('super_admin'), authController.switchPlant);

module.exports = router;