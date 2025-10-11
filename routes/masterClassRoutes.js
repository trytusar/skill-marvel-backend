const express = require('express');
const router = express.Router();
const masterClassController = require('../controllers/masterClassController');
//const upload = require('../middleware/upload'); // If you use multer for file uploads
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, 'uploads/master-class/');
        cb(null, `.${uploadPaths.MASTER_CLASS_IMAGE}/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
    
// Add a masterclass (admin only)
router.post('/save-master-class', auth.authMiddleware, upload.single('image'), masterClassController.addMasterClass);

// Update a masterclass (admin only)
router.put('/update-master-class/:id', auth.authMiddleware, upload.single('image'), masterClassController.updateMasterClass);

// Get all masterclasses
router.get('/get-master-classes', masterClassController.getMasterClasses);

// Get masterclass by ID
router.get('/get-master-class/:id', masterClassController.getMasterClassById);

// Soft delete masterclass (admin only)
router.delete('/delete-master-class/:id', auth.authMiddleware, masterClassController.deleteMasterClass);

// Checkout details for a masterclass
router.get('/get-master-class/:masterClassId/checkout', auth.authMiddleware, masterClassController.checkout);

// Purchase a masterclass
router.post('/get-master-class/:masterClassId/purchase', auth.authMiddleware, masterClassController.purchaseMasterClass);

module.exports = router;