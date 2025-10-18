const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const auth = require('../middlewares/authMiddleware');

// Admin middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Apply authentication and admin middleware to all routes
router.use(auth.authMiddleware);
router.use(adminMiddleware);

/**
 * @route GET /api/purchase
 * @desc Get all purchases with filtering and pagination
 * @access Admin
 * @query page, limit, status, purchasetype, startDate, endDate, minAmount, maxAmount, search
 */
router.get('/purchases', purchaseController.getAllPurchases);

/**
 * @route GET /api/purchase/stats
 * @desc Get purchase statistics and analytics
 * @access Admin
 */
router.get('/stats', purchaseController.getPurchaseStats);

/**
 * @route GET /api/purchase/export
 * @desc Export purchases to CSV format
 * @access Admin
 */
router.get('/export', purchaseController.exportPurchases);

/**
 * @route GET /api/purchase/user/:userId
 * @desc Get purchases by specific user
 * @access Admin
 * @query page, limit
 */
router.get('/user/:userId', purchaseController.getPurchasesByUser);

/**
 * @route GET /api/purchase/:id
 * @desc Get purchase by ID
 * @access Admin
 */
router.get('/:id', purchaseController.getPurchaseById);

/**
 * @route PUT /api/purchase/:id/status
 * @desc Update purchase status
 * @access Admin
 * @body status, paymentId
 */
router.put('/:id/status', purchaseController.updatePurchaseStatus);

/**
 * @route DELETE /api/purchase/:id
 * @desc Delete purchase
 * @access Admin
 */
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
