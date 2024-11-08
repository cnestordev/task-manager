const express = require('express');
const router = express.Router();
const metricController = require('../controllers/metricController');

// Metric Routes
router.get('/getMetrics', metricController.getMetrics); // Get metrics

module.exports = router;