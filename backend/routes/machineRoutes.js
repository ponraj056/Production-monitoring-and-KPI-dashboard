const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', machineController.getAllMachines);
router.get('/:id', machineController.getMachineById);
router.post('/', verifyToken, machineController.createMachine);
router.put('/:id', verifyToken, machineController.updateMachine);
router.delete('/:id', verifyToken, requireRole('admin'), machineController.deleteMachine);

module.exports = router;