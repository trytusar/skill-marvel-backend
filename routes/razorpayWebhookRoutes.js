const express = require('express');
const router = express.Router();
const razorpayWebhookController = require('../controllers/razorpayWebhookController');

// Middleware to capture raw body for webhook signature verification
const rawBodyMiddleware = (req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
        let data = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            req.rawBody = data;
            try {
                req.body = JSON.parse(data);
            } catch (e) {
                req.body = {};
            }
            next();
        });
    } else {
        next();
    }
};

// Razorpay webhook endpoint
router.post('/webhook', rawBodyMiddleware, razorpayWebhookController.handleWebhook);

// Test webhook endpoint
router.post('/test', razorpayWebhookController.testWebhook);

// Get webhook events (for debugging)
router.get('/events', razorpayWebhookController.getWebhookEvents);

module.exports = router;
