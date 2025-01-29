const express = require('express');
const HealthCheckController = require('../controller/healthCheckController');

const router = express.Router();

router.get('/', HealthCheckController.healthCheckStatus);
router.all('/', HealthCheckController.handleOtherMethods);

module.exports = router;
