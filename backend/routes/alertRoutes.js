const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { requireRole } = require('../middleware/authMiddleware'); // Wait, requireRole was feature 1, let's see if it exists.

router.get('/config', alertController.getConfig);
router.post('/config', alertController.updateConfig);

module.exports = router;
