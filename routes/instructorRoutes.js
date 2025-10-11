const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, 'uploads/instructors/');
        cb(null, `.${uploadPaths.INSTRUCTOR_IMAGE}/`); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Add Instructor (admin only)
router.post('/save-instructor', auth.authMiddleware, upload.single('profilePicture'), instructorController.addInstructor);

// Update Instructor (admin only)
router.put('/update-instructor/:id', auth.authMiddleware, upload.single('profilePicture'), instructorController.updateInstructor);

// Get all Instructors
router.get('/get-instructors', instructorController.getInstructors);

// Get Instructor by ID
router.get('/get-instructor/:id', instructorController.getInstructorById);

// Delete Instructor (admin only)
router.delete('/delete-instructor/:id', auth.authMiddleware, instructorController.deleteInstructor);

module.exports = router;