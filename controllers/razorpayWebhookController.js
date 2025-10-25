const crypto = require('crypto');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');

// Razorpay webhook secret from environment variables
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Razorpay signature from headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Whether signature is valid
 */
const verifyWebhookSignature = (body, signature, secret) => {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
};

/**
 * Handle Razorpay webhook events
 */
exports.handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);
        
        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET)) {
            console.log('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;
        console.log('Received webhook event:', event.event);

        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;
            
            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;
            
            case 'order.paid':
                await handleOrderPaid(event.payload.order.entity);
                break;
            
            default:
                console.log('Unhandled webhook event:', event.event);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

/**
 * Handle successful payment capture
 */
const handlePaymentCaptured = async (payment) => {
    try {
        console.log('Payment captured:', payment.id);
        
        // Find the purchase record by order ID
        const purchase = await Purchase.findOne({ orderId: payment.order_id });
        
        if (!purchase) {
            console.log('Purchase not found for order:', payment.order_id);
            return;
        }

        // Update purchase record
        purchase.paymentId = payment.id;
        purchase.status = 'success';
        purchase.paymentResponse = payment;
        await purchase.save();

        // Update user enrollment status
        const user = await User.findById(purchase.user);
        if (user) {
            if (purchase.purchasetype === 'course') {
                user.isCourseEnrolled = true;
            } else if (purchase.purchasetype === 'masterclass') {
                user.isMasterClassEnrolled = true;
            }
            await user.save();
        }

        console.log('Payment processed successfully for purchase:', purchase._id);
    } catch (error) {
        console.error('Error handling payment capture:', error);
    }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (payment) => {
    try {
        console.log('Payment failed:', payment.id);
        
        // Find the purchase record by order ID
        const purchase = await Purchase.findOne({ orderId: payment.order_id });
        
        if (!purchase) {
            console.log('Purchase not found for order:', payment.order_id);
            return;
        }

        // Update purchase record
        purchase.paymentId = payment.id;
        purchase.status = 'failed';
        purchase.paymentResponse = payment;
        await purchase.save();

        console.log('Payment failure processed for purchase:', purchase._id);
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
};

/**
 * Handle order paid event
 */
const handleOrderPaid = async (order) => {
    try {
        console.log('Order paid:', order.id);
        
        // Find the purchase record by order ID
        const purchase = await Purchase.findOne({ orderId: order.id });
        
        if (!purchase) {
            console.log('Purchase not found for order:', order.id);
            return;
        }

        // Update purchase record
        purchase.status = 'success';
        purchase.paymentResponse = order;
        await purchase.save();

        // Update user enrollment status
        const user = await User.findById(purchase.user);
        if (user) {
            if (purchase.purchasetype === 'course') {
                user.isCourseEnrolled = true;
            } else if (purchase.purchasetype === 'masterclass') {
                user.isMasterClassEnrolled = true;
            }
            await user.save();
        }

        console.log('Order paid processed successfully for purchase:', purchase._id);
    } catch (error) {
        console.error('Error handling order paid:', error);
    }
};

/**
 * Get webhook events for debugging
 */
exports.getWebhookEvents = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .populate('masterClass', 'title')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            message: 'Webhook events retrieved successfully',
            data: purchases
        });
    } catch (error) {
        console.error('Error retrieving webhook events:', error);
        res.status(500).json({ error: 'Failed to retrieve webhook events' });
    }
};

/**
 * Test webhook endpoint
 */
exports.testWebhook = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Webhook endpoint is working',
            timestamp: new Date().toISOString(),
            headers: req.headers,
            body: req.body
        });
    } catch (error) {
        console.error('Test webhook error:', error);
        res.status(500).json({ error: 'Test webhook failed' });
    }
};
