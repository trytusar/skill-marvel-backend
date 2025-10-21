# Razorpay Frontend Integration Guide

## Overview
This guide explains how to integrate Razorpay payment gateway in your ReactJS frontend after calling the `purchaseCourse()` API.

## Backend Response Format

After calling `POST /api/course/purchase-course/:courseId`, you'll receive:

```json
{
  "message": "Course purchase initiated",
  "purchaseId": "64f1234567890abcdef12345",
  "orderId": "order_1234567890",
  "amount": 89.99,
  "currency": "INR",
  "razorpay": {
    "key": "rzp_test_xxxxxxxxxxxx",
    "orderId": "order_1234567890",
    "amount": 8999,
    "currency": "INR",
    "name": "Skill Marvel",
    "description": "Purchase of course - Course Title",
    "image": "https://yourdomain.com/course-image.jpg",
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210"
    },
    "notes": {
      "purchaseId": "64f1234567890abcdef12345",
      "courseId": "68e601c1f3c0082934d76ef6",
      "purchasetype": "course"
    },
    "theme": {
      "color": "#3399cc"
    }
  }
}
```

## ReactJS Integration

### 1. Install Razorpay SDK

```bash
npm install razorpay
# or
yarn add razorpay
```

### 2. Add Razorpay Script to HTML

Add this to your `public/index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 3. React Component Implementation

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const CoursePurchase = ({ courseId, userToken }) => {
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  const handlePurchase = async (purchaseType) => {
    try {
      setLoading(true);
      
      // Call your backend API
      const response = await axios.post(
        `/api/course/purchase-course/${courseId}`,
        { purchasetype: purchaseType },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { razorpay } = response.data;
      setPurchaseData(response.data);

      // Initialize Razorpay
      const options = {
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        image: razorpay.image,
        order_id: razorpay.orderId,
        prefill: razorpay.prefill,
        notes: razorpay.notes,
        theme: razorpay.theme,
        handler: async function (response) {
          // Payment successful
          console.log('Payment successful:', response);
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to initiate purchase. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Call your webhook or success endpoint
      await axios.post('/api/razorpay/payment-success', {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        purchaseId: purchaseData.purchaseId
      });

      alert('Payment successful! You are now enrolled in the course.');
      // Redirect to course or dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Payment success handling error:', error);
      alert('Payment successful but there was an error updating your enrollment.');
    }
  };

  return (
    <div className="purchase-container">
      <h2>Purchase Course</h2>
      
      <div className="purchase-options">
        <button 
          onClick={() => handlePurchase('course')}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Processing...' : 'Buy Course'}
        </button>
        
        <button 
          onClick={() => handlePurchase('masterclass')}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Processing...' : 'Buy Masterclass'}
        </button>
      </div>
    </div>
  );
};

export default CoursePurchase;
```

### 4. Alternative: Using useEffect Hook

```jsx
import React, { useEffect, useState } from 'react';

const RazorpayPayment = ({ razorpayConfig }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initializePayment = async () => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load');
        return;
      }

      const options = {
        key: razorpayConfig.key,
        amount: razorpayConfig.amount,
        currency: razorpayConfig.currency,
        name: razorpayConfig.name,
        description: razorpayConfig.description,
        image: razorpayConfig.image,
        order_id: razorpayConfig.orderId,
        prefill: razorpayConfig.prefill,
        notes: razorpayConfig.notes,
        theme: razorpayConfig.theme,
        handler: function (response) {
          console.log('Payment successful:', response);
          // Handle success
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    if (razorpayConfig) {
      initializePayment();
    }
  }, [razorpayConfig]);

  return <div>Processing payment...</div>;
};
```

### 5. Complete Purchase Flow Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const CoursePurchaseFlow = ({ courseId, userToken, courseDetails }) => {
  const [step, setStep] = useState('select'); // select, payment, success
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const initiatePurchase = async (purchaseType) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `/api/course/purchase-course/${courseId}`,
        { purchasetype: purchaseType },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPurchaseData(response.data);
      setStep('payment');
      
      // Initialize Razorpay payment
      initializeRazorpay(response.data.razorpay);
      
    } catch (error) {
      console.error('Purchase initiation error:', error);
      alert('Failed to initiate purchase. Please try again.');
      setLoading(false);
    }
  };

  const initializeRazorpay = (razorpayConfig) => {
    const options = {
      key: razorpayConfig.key,
      amount: razorpayConfig.amount,
      currency: razorpayConfig.currency,
      name: razorpayConfig.name,
      description: razorpayConfig.description,
      image: razorpayConfig.image,
      order_id: razorpayConfig.orderId,
      prefill: razorpayConfig.prefill,
      notes: razorpayConfig.notes,
      theme: razorpayConfig.theme,
      handler: async (response) => {
        await handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: () => {
          setStep('select');
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Verify payment on backend
      await axios.post('/api/razorpay/verify-payment', {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        purchaseId: purchaseData.purchaseId
      });

      setStep('success');
      
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="purchase-options">
            <h3>Choose Purchase Option</h3>
            <div className="options">
              <div className="option">
                <h4>Course Access</h4>
                <p>Full course content and materials</p>
                <p className="price">₹{courseDetails.price}</p>
                <button 
                  onClick={() => initiatePurchase('course')}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : 'Buy Course'}
                </button>
              </div>
              
              <div className="option">
                <h4>Masterclass</h4>
                <p>Live masterclass session</p>
                <p className="price">₹{courseDetails.masterclassamount}</p>
                <button 
                  onClick={() => initiatePurchase('masterclass')}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  {loading ? 'Processing...' : 'Buy Masterclass'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="payment-processing">
            <h3>Processing Payment...</h3>
            <p>Please complete the payment in the Razorpay window.</p>
          </div>
        );

      case 'success':
        return (
          <div className="payment-success">
            <h3>Payment Successful!</h3>
            <p>You are now enrolled in the course.</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-success"
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="course-purchase-flow">
      {renderStep()}
    </div>
  );
};

export default CoursePurchaseFlow;
```

## Environment Variables

Make sure your `.env` file has:

```env
RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

## CSS Styling

```css
.purchase-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.purchase-options {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.option {
  flex: 1;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #3399cc;
  margin: 10px 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background-color: #3399cc;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Testing

1. **Test Mode**: Use Razorpay test credentials
2. **Test Cards**: Use Razorpay test card numbers
3. **Webhook Testing**: Use ngrok for local webhook testing

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Razorpay not loading | Check script URL and network |
| Payment not redirecting | Verify options object structure |
| CORS errors | Add Razorpay domain to CORS settings |
| Amount mismatch | Ensure amount is in paisa (multiply by 100) |

This integration will provide a seamless payment experience for your users! 🚀
