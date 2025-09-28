const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

// Create a new inquiry
router.post('/', inquiryController.createInquiry);

// Get all inquiries
router.get('/', inquiryController.getAllInquiries);

// Get inquiry by ID
router.get('/:id', inquiryController.getInquiryById);

// Mark inquiry as registered
router.patch('/:id/register', inquiryController.markAsRegistered);

// Delete inquiry
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;