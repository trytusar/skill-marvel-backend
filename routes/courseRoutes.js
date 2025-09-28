const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/course/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/add-course',auth.authMiddleware,upload.single('image'),courseController.addCourse);
router.put('/update-course/:id',auth.authMiddleware,upload.single('image'),courseController.updateCourse);
router.get('/get-courses',courseController.getCourses);
router.get('/get-course/:id',courseController.getCourseById);
router.delete('/delete-course/:id',auth.authMiddleware,courseController.deleteCourse);
router.put('/:courseId/checkout',courseController.checkout);
router.put('/purchase-course/:courseId',auth.authMiddleware,courseController.purchaseCourse);
// router.post('/razorpay-webhook', courseController.razorpayWebHooks);

module.exports = router;