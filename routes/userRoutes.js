const express = require('express');
const { getUserProfile, updateUserProfile, deleteMyAccount} = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT

const router = express.Router();

// Route to get user profile
router.get('/profile', auth.authMiddleware, getUserProfile);

// Route to update user profile
router.put('/profile', auth.authMiddleware, updateUserProfile);

// // Route to delete user account
router.delete('/account', auth.authMiddleware, deleteMyAccount);

module.exports = router;