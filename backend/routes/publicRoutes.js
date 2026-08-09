const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/stats', publicController.getLiveStats);

module.exports = router;
