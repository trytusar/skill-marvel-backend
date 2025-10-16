const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

// Dashboard stats route (protected, admin only)
router.get('/dashboard-stats', auth.authMiddleware, dashboardController.getDashboardStats);
router.get('/course-stats', auth.authMiddleware, dashboardController.getCourseUserCounts);
router.get('/masterclass-stats', auth.authMiddleware, dashboardController.getMasterClassUserCounts);

module.exports = router;