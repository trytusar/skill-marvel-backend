const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // For verifying the callback signature
require('dotenv').config();
const axios = require('axios');
const getFullUrl = require('../utils/getFullUrl');
const generateStudentId = require('../utils/generateStudentId');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.addCourse = async (req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to add courses' });
        }
        const course = new Course(req.body);
        if(req.file){
            //course.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            course.image = getFullUrl.getCourseImageUrl(req);
        }
        const savedCourse = await course.save();
        res.status(201).json({ savedCourse });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to add course' });
    }
};

module.exports.updateCourse = async (req, res) => {
    try{
        const course = await Course.findById(req.params.id);
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to update this course' });
        }
        if(req.file){
            //req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            req.body.image = getFullUrl.getCourseImageUrl(req);
        }
        const update = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Course updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

module.exports.getCourses = async (req, res) => {
    try{
        const courses = await Course.find({ isSoftDelete: false }).select('-__v -isSoftDelete -createdAt -updatedAt').populate('instructor', "fullName -_id");
        res.status(200).json({ courses });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get courses' });
    }
};

module.exports.getCourseById = async (req, res) => {
    try{
        const course = await Course.findOne({ _id: req.params.id, isSoftDelete: false }).populate('instructor');
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json({ course });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get course' });
    }
};

module.exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this course' });
        }
        course.isSoftDelete = true;
        await course.save();
        res.status(200).json({ message: 'Course soft deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to soft delete course' });
    }
};

exports.checkout = async (req, res) => {
    try{
        const courseId = req.params.courseId;
        const masterClassId = req.params.masterClassId;
        const purchasetype = req.body.purchasetype;        
        let purchaseDetails = {};
        if(purchasetype === 'course'){
            const course = await Course.findById(courseId);
            if(!course){
                return res.status(404).json({ error: 'Course not found' });
            }
            purchaseDetails = { 
                id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                discount: course.discount,
                discountAmount: course.discountAmount,
                finalPrice: course.finalPrice,
                purchaseType: purchasetype,
            }
        }
        else if(purchasetype === 'masterclass'){
            const masterClass = await MasterClass.findById(masterClassId);
            if(!masterClass){
                return res.status(404).json({ error: 'Masterclass not found' });
            }
            purchaseDetails = {
                id: masterClass._id,
                title: masterClass.title,
                description: masterClass.description,
                price: masterClass.price,
                discount: masterClass.discount,
                discountAmount: masterClass.discountAmount,
                finalPrice: masterClass.finalPrice,
                purchaseType: purchasetype,
            }
        }
        else{
            return res.status(400).json({ error: 'Invalid purchase type' });
        }
        res.status(200).json({ purchaseDetails });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get checkout' });
    }
};

exports.purchaseCourse = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the request
        const courseId = req.params.courseId; // Get course ID from the request parameters
        const purchasetype = req.body.purchasetype; // Get the purchase type from the request body
        
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get the price of the course
        let amount = 0;
        if(purchasetype === 'course') {
            // Calculate price after discount if applicable
            let price = course.price;
            if (course.discount && course.discount > 0) {
            price = price - (price * course.discount / 100);
            }
            amount = price;
        }
        else if(purchasetype === 'masterclass') amount = course.masterclassamount; // Assuming price is stored in the course schema
        else return res.status(400).json({ message: 'Invalid purchase type' });
    
        console.log('amount:', amount);

        // Create a Razorpay order for the course purchase
        const options = {
            amount: Math.round(amount * 100), // amount in paisa (must be integer)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: '1', // auto capture
        };

        const order = await razorpayInstance.orders.create(options);

        // Create a new purchase document with status 'pending'
        const newPurchase = new Purchase({
            user: userId,
            purchasetype: purchasetype,
            course: courseId,
            amount: amount,
            orderId: order.id,
            paymentId: null, // Will be filled after payment success
            status: 'pending'
        });

        await newPurchase.save();

        console.log(order);
        res.status(201).json({
            message: purchasetype === 'course' ? 'Course purchase initiated' : 'Masterclass purchase initiated',
            purchaseId: newPurchase._id,
            orderId: order.id,
            amount: amount,
            currency: 'INR'
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

/*
exports.purchaseCourse = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the request
        const courseId = req.params.courseId; // Get course ID from the request parameters
        const purchasetype = req.body.purchasetype; // Get the purchase type from the request body
        const { email, name, phone } = req.body; // Get customer details from the request body

        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get the price of the course
        let amount = 0;
        if (purchasetype === 'course') {
            // Calculate price after discount if applicable
            let price = course.price;
            if (course.discount && course.discount > 0) {
                price = price - (price * course.discount / 100);
            }
            amount = price;
        } else if (purchasetype === 'masterclass') {
            amount = course.masterClassAmount; // Assuming price is stored in the course schema
        } else {
            return res.status(400).json({ message: 'Invalid purchase type' });
        }

        console.log(process.env.ZOHO_API_KEY, process.env.ZOHO_ACCOUNT_ID);

        // Create a Zoho Payments session
        const zohoResponse = await axios.post(
            `https://payments.zoho.in/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
            {
                amount: amount.toFixed(2), // Zoho expects amount as a string with 2 decimal places (e.g., "100.50")
                currency: 'INR',
                description: `Purchase of ${purchasetype} for course: ${course.title}`,
                invoice_number: `INV-${Date.now()}`, // Unique invoice number
                meta_data: [
                    { key: 'courseId', value: courseId },
                    { key: 'userId', value: userId },
                    { key: 'purchasetype', value: purchasetype }
                ]
            },
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${process.env.ZOHO_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Create a new purchase document with status 'pending'
        const newPurchase = new Purchase({
            user: userId,
            purchasetype: purchasetype,
            course: courseId,
            amount: amount,
            paymentsSessionId: zohoResponse.data.payments_session.payments_session_id, // Store Zoho session ID
            paymentId: null, // Will be filled after payment success via webhook
            status: 'pending'
        });

        await newPurchase.save();

        // Update user's isCourseEnrolled flag to true
        const user = await User.findById(userId);
        if (purchasetype === 'course') {
            user.isCourseEnrolled = true;
        } else if (purchasetype === 'masterclass') {
            user.isMasterClassEnrolled = true;
        }
        await user.save();

        console.log(zohoResponse.data);
        res.status(201).json({
            message: 'Course purchase initiated',
            purchaseId: newPurchase._id,
            paymentsSessionId: zohoResponse.data.payments_session.payments_session_id, // Send session ID to frontend
            amount: amount.toFixed(2),
            currency: 'INR'
        });

    } catch (err) {
        console.log(err)
        console.error('Error initiating Zoho payment:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to initiate course purchase' });
    }
}; */

/**
 * Unified Razorpay webhook handler for course purchase payments (success and failure)
 */

exports.razorpayWebHooks = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        const webhookBody = JSON.stringify(req.body);

        // Verify the webhook signature
        const expectedSignature = crypto.createHmac('sha256', secret).update(webhookBody).digest('hex');
        if (signature !== expectedSignature) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        const eventType = req.body.event;
        const paymentEntity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;
        if (!paymentEntity) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const paymentId = paymentEntity.id;
        const razorpayOrderId = paymentEntity.order_id;

        // Find the purchase by Razorpay order ID
        const purchase = await Purchase.findOne({ orderId: razorpayOrderId }).populate('user course');
        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' });
        }

        const course = await Course.findById(purchase.course);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (eventType === 'payment.captured') {
            // Payment success logic
            if (purchase.status !== 'completed') {
                purchase.status = 'completed';
                purchase.paymentId = paymentId;
                await purchase.save();
                // Optionally, enroll user in course or send confirmation email here
            }
            return res.status(200).json({
                success: true,
                message: 'Payment captured and purchase confirmed',
                purchaseId: purchase._id,
            });
        } else if (eventType === 'payment.failed') {
            // Payment failure logic
            if (purchase.status !== 'failed') {
                purchase.status = 'failed';
                await purchase.save();
                // Optionally, handle any course slot restoration or user notification here
            }
            return res.status(200).json({
                success: false,
                message: paymentEntity.error_description || 'Payment failed',
                errorCode: paymentEntity.error_code,
            });
        } else {
            return res.status(400).json({ error: 'Unhandled event type' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message,
        });
    }
};
