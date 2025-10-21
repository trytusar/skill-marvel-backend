const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT

router.put('/:courseId/checkout', paymentController.checkout);
router.put('/:masterClassId/masterclass-checkout', paymentController.checkout);
router.put('/purchase-course/:courseId',auth.authMiddleware, paymentController.purchaseCourseOrMasterclass);
router.put('/purchase-masterclass/:masterClassId', auth.authMiddleware, paymentController.purchaseCourseOrMasterclass);
router.post('/payment-success', auth.authMiddleware, paymentController.paymentSuccess);
router.post('/verify-payment', auth.authMiddleware, paymentController.verifyPayment);
router.post('/razorpay-webhook', paymentController.razorpayWebHooks);
router.get('/get-purchases-by-user',auth.authMiddleware, paymentController.getPurchasesByUser);
/*router.get('/get-purchase-by-id/:id',auth.authMiddleware,paymentController.getPurchaseById);
router.put('/update-purchase-status/:id',auth.authMiddleware,paymentController.updatePurchaseStatus);
router.delete('/delete-purchase/:id',auth.authMiddleware,paymentController.deletePurchase);
router.get('/get-all-purchases',auth.authMiddleware,paymentController.getAllPurchases);
router.get('/get-purchase-statistics',auth.authMiddleware,paymentController.getPurchaseStatistics);
router.get('/export-purchases',auth.authMiddleware,paymentController.exportPurchases);
*/

module.exports = router;