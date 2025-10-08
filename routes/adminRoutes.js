const express = require('express');
const { getAdminProfile } = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT

const router = express.Router();

// Route to get admin profile
router.get('/profile', auth.authMiddleware, getAdminProfile);
 

module.exports = router;