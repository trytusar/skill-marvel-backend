// routes/authRoutes.js
const express = require('express');
const { registerPhoneNumber, verifyOtp, registerUserDetails,resendOtp, createAdmin, loginAdmin } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT

const router = express.Router();

router.post('/register-phone', registerPhoneNumber);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/register-details', auth.authMiddleware,registerUserDetails);
router.post('/create-admin', createAdmin);
router.post('/login-admin', loginAdmin);

module.exports = router;
