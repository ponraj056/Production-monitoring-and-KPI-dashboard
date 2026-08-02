const express = require('express');
const router = express.Router();
const productionLogController = require('../controllers/productionLogController');

router.get('/', productionLogController.getAllLogs);
router.get('/:id', productionLogController.getLogById);
router.post('/', productionLogController.createLog);
router.put('/:id', productionLogController.updateLog);
router.delete('/:id', productionLogController.deleteLog);

module.exports = router;