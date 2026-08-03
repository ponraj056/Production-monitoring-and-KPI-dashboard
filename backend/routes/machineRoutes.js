const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

// Everyone (operator, supervisor, admin) can view
router.get('/', authenticateToken, machineController.getAllMachines);
router.get('/:id', authenticateToken, machineController.getMachineById);

// Only supervisor/admin can write
router.post('/', authenticateToken, requireRole('admin', 'supervisor'), machineController.createMachine);
router.put('/:id', authenticateToken, requireRole('admin', 'supervisor'), machineController.updateMachine);
router.delete('/:id', authenticateToken, requireRole('admin', 'supervisor'), machineController.deleteMachine);

module.exports = router;