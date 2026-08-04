const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

router.get('/by-shift', kpiController.getByShift);
router.get('/', kpiController.getKpiSummary);

module.exports = router;