// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false },
    referralCode: { type: String, required: false },
    referredBy: { type: String },  // If referred by someone else, store their referral code
    graphyUserId: { type: String, default: null },  // To store the Graphy API user ID
    isCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, 
    role: { type: String, default: 'user', enum:['user', 'admin'] }, // 'user' or 'admin'
},{timestamps: true});

module.exports = mongoose.model('users', userSchema);