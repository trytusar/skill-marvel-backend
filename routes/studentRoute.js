const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

// For bulk CSV upload
const upload = multer({ dest: 'uploads/csv/' });

// List all students (admin only)
router.get('/list-all-students', auth.authMiddleware, studentController.listAllStudents);

// List all user signups (admin only)
router.get('/list-all-signups', auth.authMiddleware, studentController.listAllSignUps);

// Add single student (admin only)
router.post('/add-student', auth.authMiddleware, studentController.addStudent);

// Bulk enroll students (admin only)
router.post('/bulk-enroll', auth.authMiddleware, upload.single('csvFile'), studentController.bulkEnrollStudents);

module.exports = router;