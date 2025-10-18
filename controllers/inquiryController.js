const Inquiry = require('../models/inquiryModel');

exports.createInquiry = async (req, res) => {
    try {
        const inquiry = new Inquiry(req.body);
        await inquiry.save();
        res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
};

exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ inquiries });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

exports.getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.status(200).json({ inquiry });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
};

exports.markAsRegistered = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        const isRegistered = inquiry.isRegistered;
        inquiry.isRegistered = !isRegistered;
        await inquiry.save();
        res.status(200).json({ message: 'Inquiry marked as registered' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

exports.deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
};