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
const {calculateCoursePrice, calculateMasterClassPrice} = require('../utils/calculatePrice');
const Enrollment = require('../models/enrollmentModel');
const MasterClassEnrollment = require('../models/masterClassEnrollmentModel');
const { enrollUserInCourse, enrollUserInMasterClass } = require('../utils/enrollmentUtils');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

 
exports.checkout = async (req, res) => {
    try{
        //console.log('req.user:', req.user);
       // console.log(' req.user.id:',  req.user.id);
       console.log('req.body:', req.body);

       //const gst = 0.18;
       const gst = 0;
        
        const purchasetype = req.body.purchasetype;        
        let purchaseDetails = {};
        if(purchasetype === 'course'){
            const courseId = req.params.courseId;
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
            const priceInfo = calculateCoursePrice(course, gst);
            purchaseDetails.priceInfo = priceInfo;   
        }
        else if(purchasetype === 'masterclass'){
            const masterClassId = req.params.masterClassId;
            console.log('masterClassId:', masterClassId);
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
            const priceInfo = calculateMasterClassPrice(masterClass, gst);
            purchaseDetails.priceInfo = priceInfo;   
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

exports.purchaseCourseOrMasterclass = async (req, res) => {
    try {
        //console.log('req.user:', req.user);
        //console.log(' req.user.id:',  req.user.id);

        //const gst = 0.18;
        const gst = 0;

        const userId = req.user.id; // Get the user ID from the request 
        const purchasetype = req.body.purchasetype; // Get the purchase type from the request body
        //const finalPrice = req.body.finalPrice; // Get finalPrice from the request body
        
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        // Get the price of the course or masterclass
        let amount = 0;
        let courseId = null;
        let masterClassId = null;
        let course = null;
        let masterClass = null;
        if(purchasetype === 'course') {
            courseId = req.params.courseId; // Get course ID from the request parameters
            // Find the course
            course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            //amount = getFinalCoursePrice(course);    
            const priceInfo = calculateCoursePrice(course, gst);
            amount = priceInfo.finalPrice;       
            console.log("priceInfo:", priceInfo);         
        }
        else if(purchasetype === 'masterclass') {
            masterClassId = req.params.masterClassId; // Get masterclass ID from the request parameters
            masterClass = await MasterClass.findById(masterClassId);
            if(!masterClass){
                return res.status(404).json({ error: 'Masterclass not found' });
            }
            //amount = getFinalMasterClassPrice(masterClass);    
            const priceInfo = calculateMasterClassPrice(masterClass, gst);
            amount = priceInfo.finalPrice;
            console.log("priceInfo:", priceInfo);
        }
        else 
            return res.status(400).json({ message: 'Invalid purchase type' });
    
        console.log('amount:', amount, masterClass);
        const title = purchasetype === 'course' ? course.title : masterClass.title;
        const image = purchasetype === 'course' ? course.image : masterClass.image;

        //START OF FREE PURCHASE LOGIC
        // If the course/masterclass is free, skip Razorpay and enroll immediately
        if (amount <= 0) {
            const newPurchase = new Purchase({
                user: userId,
                purchasetype: purchasetype,
                course: purchasetype === 'course' ? courseId : undefined,
                masterClass: purchasetype === 'masterclass' ? masterClassId : undefined,
                amount: 0,
                orderId: null,
                paymentId: 'FREE',
                status: 'success',
                paymentResponse: { reason: 'Free purchase - no payment required' }
            });

            await newPurchase.save();

            // Update user enrollment immediately
            /*if (purchasetype === 'course') {
                if (user) {
                    user.isCourseEnrolled = true;
                    if(!user.studentId){
                        user.studentId = await generateStudentId();
                    }
                    await user.save();
                }
            } else if (purchasetype === 'masterclass') {
                if (user) {
                    user.isMasterClassEnrolled = true;
                    if(!user.studentId){
                        user.studentId = await generateStudentId();
                    }
                    await user.save();
                }
            }*/

            if(purchasetype === 'course'){
                const enrollmentResult = await enrollUserInCourse(user._id, courseId);
                if (!enrollmentResult.success) {
                    console.error('Course enrollment failed:', enrollmentResult.message);
                    return res.status(404).json({ error: enrollmentResult.message });
                } else if (!enrollmentResult.alreadyEnrolled) {
                    console.log('User enrolled in course:', enrollmentResult.message);
                }         
            }
            if(purchasetype === 'masterclass'){
                console.log("masterClassId:", masterClassId);
                const enrollmentResult = await enrollUserInMasterClass(user._id, masterClassId);
                if (!enrollmentResult.success) {
                  console.error('Masterclass enrollment failed:', enrollmentResult.message);
                  return res.status(404).json({ error: enrollmentResult.message });
                } else if (!enrollmentResult.alreadyEnrolled) {
                  console.log('User enrolled in masterclass:', enrollmentResult.message);
                }
            }

            return res.status(201).json({
                message: purchasetype === 'course' ? 'Course enrolled (free)' : 'Masterclass enrolled (free)',
                purchaseId: newPurchase._id,
                orderId: null,
                title:title,
                description: `Purchase of ${purchasetype} - ${title}`,
                image: image || '/logo.png',
                amount: 0,
                currency: 'INR',
                free: true,
            });
        } //END OF FREE PURCHASE LOGIC

        //amount = getAmountWithTax(amount); // Not required

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
            course: purchasetype === 'course' ? courseId : undefined,
            masterClass: purchasetype === 'masterclass' ? masterClassId : undefined,
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
            title:title,
            amount: amount,
            currency: 'INR',
            // Razorpay configuration for frontend
            razorpay: {
                key: process.env.RAZORPAY_KEY,
                orderId: order.id,
                amount: Math.round(amount * 100), // amount in paisa
                currency: 'INR',
                name: 'Skill Marvel',
                description: `Purchase of ${purchasetype} - ${title}`,
                image: image || '/logo.png',
                prefill: {
                    name: user.firstName + ' ' + user.lastName || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || ''
                },
                notes: {
                    purchaseId: newPurchase._id,
                    courseId: purchasetype === 'course' ? courseId : undefined,
                    masterClassId: purchasetype === 'masterclass' ? masterClassId : undefined,
                    purchasetype: purchasetype
                },
                theme: {
                    color: '#3399cc'
                }
            }
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

/** tax = 18% */
function getAmountWithTax(amount) {
   /* const tax = 18; //18%
    let finalAmount = (amount*tax)/100;
    finalAmount = finalAmount.toFixed(2);
    return price; */

    let finalAmount = Math.round(amount * 1.18);
    finalAmount = finalAmount.toFixed(2);
    return finalAmount;
}

function getFinalMasterClassPrice(masterClass) {
    let price = masterClass.price;

    if (masterClass.discount && masterClass.discount > 0) {
        // Apply percentage discount
        price = price - (price * masterClass.discount / 100);
    } 
    else if (masterClass.discountAmount && masterClass.discountAmount > 0) {
        // Apply flat discount amount
        price = price - masterClass.discountAmount;
    }
    price = price.toFixed(2);
    return price;
}

function getFinalCoursePrice(course) {
    let price = course.price;
    if (course.discount && course.discount > 0) {
        price = price - (price * course.discount / 100);
    }
    else if (course.discountAmount && course.discountAmount > 0) {
        price = price - course.discountAmount;
    }
    price = price.toFixed(2);
    return price;
}

/**
 * Handle payment success from frontend
 */
exports.paymentSuccess = async (req, res) => {
    try {
        const { 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature, 
            purchaseId 
        } = req.body;

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !purchaseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment information'
            });
        }

        // Find the purchase record
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase record not found'
            });
        }

        // Verify payment signature (optional but recommended)
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.log('Payment signature verification failed');
            // You might want to still process the payment but log the issue
        }

        // Update purchase record
        purchase.paymentId = razorpay_payment_id;
        purchase.status = 'success';
        purchase.paymentResponse = {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            verified_at: new Date()
        };
        await purchase.save();

        // Update user enrollment status
        const user = await User.findById(purchase.user);
        if (user) {
            //Only generate if studentId is null           
            if (purchase.purchasetype === 'course') {
                user.isCourseEnrolled = true;
            } else if (purchase.purchasetype === 'masterclass') {
                user.isMasterClassEnrolled = true;
            }
            if(!user.studentId){
                user.studentId = await generateStudentId();
            }
            await user.save();
        }

        let course = null;
        let masterclass = null;

        if(purchase.purchasetype === 'course'){
            course = await Course.findById(purchase.course);
            const enrollment = new Enrollment({ user: user._id, course: course._id });
            await enrollment.save();           
        }
        if(purchase.purchasetype === 'masterclass'){
            masterclass = await MasterClass.findById(purchase.masterClass);
            const masterClassEnrollment = new MasterClassEnrollment({ user: user._id, masterClass: masterclass._id });
            await masterClassEnrollment.save(); 
        }

        res.status(200).json({
            success: true,
            message: 'Payment successful! You are now enrolled.',
            data: {
                purchase: {
                    id: purchase._id,
                    status: purchase.status,
                    amount: purchase.amount,
                    purchasetype: purchase.purchasetype,
                    paymentId: purchase.paymentId
                },
                course: course ? {
                    id: course._id,
                    title: course.title,
                    image: course.image
                } : null,
                masterclass: masterclass ? {
                    id: masterclass._id,
                    title: masterclass.title,
                    image: masterclass.image
                } : null,
                user: {
                    isCourseEnrolled: user.isCourseEnrolled,
                    isMasterClassEnrolled: user.isMasterClassEnrolled
                }
            }
        });

    } catch (error) {
        console.error('Payment success error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment success',
            error: error.message
        });
    }
};

/**
 * Verify payment signature
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification data'
            });
        }

        // Create expected signature
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        res.status(200).json({
            success: true,
            data: {
                isValid,
                message: isValid ? 'Payment signature is valid' : 'Payment signature is invalid'
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};
 
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


/*  ***************************************************** */

/**
 * Get purchases by user
 */
exports.getPurchasesByUser = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the request
        const purchases = await Purchase.find({ user: userId })
            .populate('course', 'title price finalPrice')
            .populate('masterClass', 'title price finalPrice')
            .sort({ createdAt: -1 });
        const totalPurchases = await Purchase.countDocuments({ user: userId });
        
        res.status(200).json({
            success: true,
            data: {
                purchases,
                totalPurchases,
            }
        });
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user purchases',
            error: error.message
        });
    }
};

