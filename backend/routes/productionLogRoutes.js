const express = require('express');
const router = express.Router();
const productionLogController = require('../controllers/productionLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', authenticateToken, productionLogController.getAllLogs);
router.get('/:id', authenticateToken, productionLogController.getLogById);
router.post('/', authenticateToken, requireRole('admin', 'supervisor'), productionLogController.createLog);
router.put('/:id', authenticateToken, requireRole('admin', 'supervisor'), productionLogController.updateLog);
router.delete('/:id', authenticateToken, requireRole('admin', 'supervisor'), productionLogController.deleteLog);

module.exports = router;