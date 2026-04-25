const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');

// All report routes require authentication
router.use(requireAuth);

// GET /api/reports/time - Get time report with task details and totals
router.get('/time', reportController.getTimeReport);

// GET /api/reports/task/:taskId - Get worklog summary for a specific task
router.get('/task/:taskId', reportController.getTaskWorklogSummary);

// GET /api/reports/user/:userId - Get worklog summary for a specific user
router.get('/user/:userId', reportController.getUserWorklogSummary);

// GET /api/reports/range - Get report for date range
router.get('/range', reportController.getDateRangeReport);

module.exports = router;