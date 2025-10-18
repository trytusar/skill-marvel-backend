# Razorpay Webhook Setup Guide

## Overview
This guide explains how to set up and use Razorpay webhooks in your Skill Marvel Backend application.

## Webhook Endpoints

### 1. Main Webhook Endpoint
```
POST /api/razorpay/webhook
```
This is the main webhook endpoint that Razorpay will call to notify about payment events.

### 2. Test Webhook Endpoint
```
POST /api/razorpay/test
```
Use this endpoint to test if your webhook is working correctly.

### 3. Get Webhook Events
```
GET /api/razorpay/events
```
Retrieve recent webhook events for debugging purposes.

## Environment Variables Required

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

## Setting Up Webhooks in Razorpay Dashboard

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com/
   - Login with your credentials

2. **Navigate to Webhooks**
   - Go to Settings > Webhooks
   - Click "Add New Webhook"

3. **Configure Webhook**
   - **URL**: `https://yourdomain.com/api/razorpay/webhook`
   - **Events to send**:
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
   - **Secret**: Generate a strong secret (save this in your `.env` file)

4. **Test the Webhook**
   - Use the test endpoint: `POST /api/razorpay/test`
   - Check Razorpay dashboard for webhook delivery status

## Webhook Events Handled

### 1. Payment Captured (`payment.captured`)
- Updates purchase status to 'success'
- Updates user enrollment status
- Stores payment details

### 2. Payment Failed (`payment.failed`)
- Updates purchase status to 'failed'
- Stores failure details

### 3. Order Paid (`order.paid`)
- Updates purchase status to 'success'
- Updates user enrollment status

## Webhook Security

The webhook endpoint includes signature verification to ensure requests are from Razorpay:

```javascript
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
```

## Testing Webhooks Locally

### Using ngrok (Recommended)
1. Install ngrok: `npm install -g ngrok`
2. Start your server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL in Razorpay dashboard: `https://abc123.ngrok.io/api/razorpay/webhook`

### Using localtunnel
1. Install localtunnel: `npm install -g localtunnel`
2. Start your server: `npm run dev`
3. In another terminal: `lt --port 3000`
4. Use the localtunnel URL in Razorpay dashboard

## Webhook URL for Production

For production, use your actual domain:
```
https://yourdomain.com/api/razorpay/webhook
```

## Debugging Webhooks

1. **Check Logs**: Monitor console logs for webhook events
2. **Use Events Endpoint**: `GET /api/razorpay/events` to see recent events
3. **Razorpay Dashboard**: Check webhook delivery status in dashboard
4. **Test Endpoint**: Use `POST /api/razorpay/test` to verify connectivity

## Common Issues and Solutions

### 1. Webhook Not Receiving Events
- Check if webhook URL is accessible from internet
- Verify webhook secret in environment variables
- Check Razorpay dashboard for delivery status

### 2. Signature Verification Failed
- Ensure `RAZORPAY_WEBHOOK_SECRET` is correct
- Check if raw body is being captured properly
- Verify webhook secret in Razorpay dashboard

### 3. Purchase Not Found
- Ensure order ID is being stored correctly in purchase record
- Check if purchase record exists before webhook processing

## Example Webhook Payload

```json
{
  "event": "payment.captured",
  "account_id": "acc_xxxxxxxxxxxx",
  "created_at": 1640995200,
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxxxxxxxxx",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_xxxxxxxxxxxx",
        "method": "card",
        "captured": true,
        "created_at": 1640995200
      }
    }
  }
}
```

## Monitoring and Logs

The webhook controller logs all events to the console. For production, consider:

1. **Database Logging**: Store webhook events in database
2. **External Logging**: Use services like Winston, Morgan
3. **Monitoring**: Set up alerts for webhook failures
4. **Retry Logic**: Implement retry mechanism for failed webhooks

## Security Best Practices

1. **Always verify webhook signatures**
2. **Use HTTPS in production**
3. **Keep webhook secrets secure**
4. **Implement rate limiting**
5. **Log all webhook events for audit**

## Support

For issues related to:
- **Razorpay Integration**: Check Razorpay documentation
- **Webhook Setup**: Verify URL accessibility and secret configuration
- **Code Issues**: Check console logs and error messages
