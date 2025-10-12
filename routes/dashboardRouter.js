const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

// Dashboard stats route (protected, admin only)
router.get('/dashboard-stats', auth.authMiddleware, dashboardController.getDashboardStats);

module.exports = router;