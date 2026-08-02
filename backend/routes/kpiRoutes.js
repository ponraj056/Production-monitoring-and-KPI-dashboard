const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

router.get('/', kpiController.getKpiSummary);

module.exports = router;