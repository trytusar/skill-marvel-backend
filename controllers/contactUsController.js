const ContactUs = require('../models/contactUsModel');

exports.createInquiry = async (req, res) => {
    try {
        const inquiry = new ContactUs(req.body);
        await inquiry.save();
        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};

exports.getAllInquiries = async (req, res) => {
    try {
        const contacts = await ContactUs.find().sort({ createdAt: -1 });
        res.status(200).json({ contacts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch Contact Us' });
    }
};

exports.getInquiryById = async (req, res) => {
    try {
        const inquiry = await ContactUs.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Contact Us not found' });
        }
        res.status(200).json({ inquiry });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch Contact Us' });
    }
};

exports.resolveInquiry = async (req, res) => {
    try {
        const inquiry = await ContactUs.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Contact Us not found' });
        }        
        const isResolved = inquiry.isResolved;
        inquiry.isResolved = !isResolved;
        await inquiry.save();
        res.status(200).json({ message: 'Contact Us marked as resolved' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to resolve Contact Us' });
    }
};

exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await ContactUs.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Contact Us not found' });
        }
        res.status(200).json({ message: 'Contact Us deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to delete Contact Us' });
    }
};