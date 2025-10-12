// controllers/authController.js
const User = require('../models/userModel');
const otpModel = require('../models/otpModel');
const {  sendOtpWhatsapp  } = require('../services/otpService');
const { createGraphyLearner } = require('../services/graphyService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

// Generate OTP and send to phone number
exports.registerPhoneNumber = async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000); // Generate 6 digit OTP
    const otpSent = await sendOtpWhatsapp(phoneNumber, otp);

    if (otpSent) {
        // Check if user with this phone number already exists
        let existingUser = await User.findOne({ phoneNumber });
        console.log(existingUser);

        if (existingUser) {
            console.log('User already exists:', existingUser);
            // If the user exists, update the OTP
            const newOtp = new otpModel({
                phoneNumber,
                otp,
            });
            await newOtp.save();
            res.status(200).json({ message: 'OTP updated successfully' });
        } else {
            // If the user does not exist, create a new user and save OTP
            const newUser = new User({
                phoneNumber,
            });
            await newUser.save();

            const newOtp = new otpModel({
                phoneNumber,
                otp,
            });
            await newOtp.save();
            res.status(200).json({ message: 'OTP sent successfully' });
        }
    } else {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otp = Math.floor(1000 + Math.random() * 9000); // Generate 6 digit OTP
        const otpSent = await sendOtpWhatsapp(phoneNumber, otp);
        if (otpSent) {
            const newOtp = new otpModel({
                phoneNumber,
                otp,
            });
            await newOtp.save();
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
};

// Verify OTP (For demo purposes, skipping actual OTP verification)
exports.verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Get the current time
    const currentTime = new Date();

    // Calculate the time 5 minutes ago
    const fiveMinutesAgo = new Date(currentTime - 5 * 60 * 1000);

    // Find the OTP
    const otpVerified = await otpModel.findOne({
        phoneNumber,
        otp,
        isUsed: false,
        createdAt: { $gte: fiveMinutesAgo } // Compare with the time 5 minutes ago
    });

    if (!otpVerified) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark the OTP as used
    otpVerified.isUsed = true;
    await otpVerified.save();

    // Update the user status and retrieve the user
    const user = await User.findOneAndUpdate(
        { phoneNumber },
        { isVerified: true },
        { lastLogin: new Date() },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Create JWT token using the user's _id
    const token = jwt.sign(
        { id: user._id, isVerified: user.isVerified ,role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'OTP verified', phoneNumber, isCompleted: user.isCompleted, token });
};

// Register user with name, email, and referral
exports.registerUserDetails = async (req, res) => {
    const { phoneNumber, firstName, lastName, email } = req.body;

    try {
        const exitingUser = await User.findOne({ phoneNumber });
        if(!exitingUser.isActive){
            return res.status(400).json({ error: 'Phone number not verified' });
        }
        if(req.user.id !== exitingUser._id.toString()){
            return res.status(400).json({ error: 'You are not authorished to modify this details' });
        }
        const savedUser= await User.findByIdAndUpdate(req.user.id, {
            firstName,
            lastName,
            email,
            isCompleted: true,
        }, {new: true});
        // Call Graphy API to create the learner
        const graphyResponse = await createGraphyLearner(savedUser, process.env.GRAPHY_API_KEY, process.env.GRAPHY_MERCHANT_ID);

        res.status(201).json({ message: 'User registered successfully', user: savedUser, graphy: graphyResponse });
        // res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

module.exports.createAdmin = async (req, res) => {
    try{
        const hasedPassword = await bcrypt.hash(req.body.password, 10);
        const admin = Admin({
            name: req.body.name,
            email: req.body.email,
            password: hasedPassword
        })
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Error creating Admin' });
    }
};

module.exports.loginAdmin = async (req, res) => {
    try{
        const admin = await Admin.findOne({email: req.body.email});
        if(!admin){
            return res.status(404).json({ error: 'Admin not found' });
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({ error: 'Invalid Password' });
        }
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ message: 'Admin logged in successfully', token });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Error logging in Admin' });
    }
};