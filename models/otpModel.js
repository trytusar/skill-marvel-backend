const e = require('express');
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    otp: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
},{timestamps: true});

const otpModel = mongoose.model('otps', otpSchema);
module.exports = otpModel;