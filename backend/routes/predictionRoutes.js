const express = require('express');
const router = express.Router();
const predictionsController = require('../controllers/predictionsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/downtime-risk', authenticateToken, predictionsController.getDowntimeRisk);

module.exports = router;
