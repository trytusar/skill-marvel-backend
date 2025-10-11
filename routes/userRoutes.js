const express = require('express');
const { getUserProfile, updateUserProfile, deleteMyAccount} = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const router = express.Router();
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, 'uploads/users/');
        cb(null, `.${uploadPaths.USER_IMAGE}/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route to get user profile
router.get('/profile', auth.authMiddleware, getUserProfile);

// Route to update user profile
router.put('/update-profile', auth.authMiddleware, upload.single('profilePicture'), updateUserProfile);

// // Route to delete user account
router.delete('/account', auth.authMiddleware, deleteMyAccount);

module.exports = router;