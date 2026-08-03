const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/export', authenticateToken, reportsController.exportReport);

module.exports = router;
