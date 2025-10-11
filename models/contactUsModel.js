const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    company: {
        type: String,
        required: false,
        trim: true
    },
    inquiryType: {
        type: String,
        required: true,
        enum: ['General Inquiry', 'Support', 'Sales', 'Feedback', 'Other'],
        default: 'General Inquiry'
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isResolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ContactUs = mongoose.model('contactus', contactUsSchema);
module.exports = ContactUs;
