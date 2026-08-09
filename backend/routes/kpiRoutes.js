const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/by-shift', authenticateToken, kpiController.getByShift);
router.get('/', authenticateToken, kpiController.getKpiSummary);


module.exports = router;