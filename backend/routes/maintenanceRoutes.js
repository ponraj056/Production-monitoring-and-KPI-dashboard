const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

// Everyone can view maintenance schedules
router.get('/', authenticateToken, maintenanceController.getAllSchedules);

// Only supervisor/admin can write/update
router.post('/', authenticateToken, requireRole('admin', 'supervisor'), maintenanceController.createSchedule);
router.put('/:id', authenticateToken, requireRole('admin', 'supervisor'), maintenanceController.updateStatus);
router.delete('/:id', authenticateToken, requireRole('admin', 'supervisor'), maintenanceController.deleteSchedule);

module.exports = router;
