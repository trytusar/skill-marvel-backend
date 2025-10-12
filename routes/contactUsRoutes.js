const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');

// Create a new inquiry
router.post('/save-contact-us', contactUsController.createInquiry);

// Get all inquiries
router.get('/get-contact-us-list', contactUsController.getAllInquiries);

// Get inquiry by ID
router.get('/get-contact-us/:id', contactUsController.getInquiryById);

// Mark inquiry as resolved
router.patch('/resolve-contact-us/:id', contactUsController.resolveInquiry);

// Delete inquiry
router.delete('/delete-contact-us/:id', contactUsController.deleteInquiry);

module.exports = router;