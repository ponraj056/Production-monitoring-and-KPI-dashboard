const express = require('express');
const router = express.Router();
const downtimeLogController = require('../controllers/downtimeLogController');

router.get('/', downtimeLogController.getAllDowntimeLogs);
router.get('/:id', downtimeLogController.getDowntimeLogById);
router.post('/', downtimeLogController.createDowntimeLog);
router.put('/:id', downtimeLogController.updateDowntimeLog);
router.delete('/:id', downtimeLogController.deleteDowntimeLog);

module.exports = router;