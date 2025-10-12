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
        const inquiries = await ContactUs.find().sort({ createdAt: -1 });
        res.status(200).json({ inquiries });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

exports.getInquiryById = async (req, res) => {
    try {
        const inquiry = await ContactUs.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.status(200).json({ inquiry });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
};

exports.resolveInquiry = async (req, res) => {
    try {
        const inquiry = await ContactUs.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        inquiry.isResolved = true;
        await inquiry.save();
        res.status(200).json({ message: 'Inquiry marked as resolved' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to resolve inquiry' });
    }
};

exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await ContactUs.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
};