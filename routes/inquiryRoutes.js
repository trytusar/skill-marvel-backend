const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

// Create a new inquiry
router.post('/save-inquiry', inquiryController.createInquiry);

// Get all inquiries
router.get('/get-inquiry-list', inquiryController.getAllInquiries);

// Get inquiry by ID
router.get('/get-inquiry/:id', inquiryController.getInquiryById);

// Mark inquiry as registered
router.patch('/register-inquiry/:id', inquiryController.markAsRegistered);

// Delete inquiry
router.delete('/delete-inquiry/:id', inquiryController.deleteInquiry);

module.exports = router;