const express = require('express');
const router = express.Router();
const downtimeLogController = require('../controllers/downtimeLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

// Everyone (operator, supervisor, admin) can view
router.get('/', authenticateToken, downtimeLogController.getAllDowntimeLogs);
router.get('/:id', authenticateToken, downtimeLogController.getDowntimeLogById);

// Only supervisor/admin can write
router.post('/', authenticateToken, requireRole('admin', 'supervisor'), downtimeLogController.createDowntimeLog);
router.put('/:id', authenticateToken, requireRole('admin', 'supervisor'), downtimeLogController.updateDowntimeLog);
router.delete('/:id', authenticateToken, requireRole('admin', 'supervisor'), downtimeLogController.deleteDowntimeLog);

module.exports = router;