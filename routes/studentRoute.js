const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `.${uploadPaths.USER_CSV}/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// For bulk CSV upload
//const upload = multer({ dest: 'uploads/csv/' });

// List all students (admin only)
router.get('/list-all-students', auth.authMiddleware, studentController.listAllStudents);

// List all user signups (admin only)
router.get('/list-all-signups', auth.authMiddleware, studentController.listAllSignUps);
router.get('/list-all-enrolled-users', auth.authMiddleware, studentController.listAllEnrolledUsers);
router.get('/list-all-master-class-enrolled-users', auth.authMiddleware, studentController.listAllMasterClassEnrolledUsers);

// Add single student (admin only)
router.post('/add-student', auth.authMiddleware, upload.single('profilePicture'), studentController.addStudent);
router.put('/update-student/:id', auth.authMiddleware, upload.single('profilePicture'), studentController.updateStudent);

// Bulk enroll students (admin only)
router.post('/bulk-enroll', auth.authMiddleware, upload.single('csvFile'), studentController.bulkEnrollStudents);

router.get('/student-details/:id', auth.authMiddleware, studentController.getStudentDetailsById);
router.get('/search-student-details/:id', auth.authMiddleware, studentController.getDetailsByStudentId);

module.exports = router;