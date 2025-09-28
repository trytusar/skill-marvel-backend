const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    countryCode: {
        type: String,
        required: true,
        default: '+91'
    },
    mobileNumber: {
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
    interestedCourse: {
        type: String,
        required: true,
        trim: true
    },
    isRegistered: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Inquiry = mongoose.model('inquiries', inquirySchema);
module.exports = Inquiry;
