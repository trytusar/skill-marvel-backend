const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');

// Create a new inquiry
router.post('/', contactUsController.createInquiry);

// Get all inquiries
router.get('/', contactUsController.getAllInquiries);

// Get inquiry by ID
router.get('/:id', contactUsController.getInquiryById);

// Mark inquiry as resolved
router.patch('/:id/resolve', contactUsController.resolveInquiry);

// Delete inquiry
router.delete('/:id', contactUsController.deleteInquiry);

module.exports = router;