const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');

/**
 * Get all purchases with filtering and pagination
 */
exports.getAllPurchases = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        
        // Filter by status
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Filter by purchase type
        if (req.query.purchasetype) {
            filter.purchasetype = req.query.purchasetype;
        }
        
        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // Filter by amount range
        if (req.query.minAmount || req.query.maxAmount) {
            filter.amount = {};
            if (req.query.minAmount) {
                filter.amount.$gte = parseFloat(req.query.minAmount);
            }
            if (req.query.maxAmount) {
                filter.amount.$lte = parseFloat(req.query.maxAmount);
            }
        }

        // Search by user name or email
        let userFilter = {};
        if (req.query.search) {
            userFilter = {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        // Get purchases with populated data
        const purchases = await Purchase.find(filter)
            .populate({
                path: 'user',
                select: 'name email phone',
                match: userFilter
            })
            .populate('course', 'title price discount')
            .populate('masterClass', 'title price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalPurchases = await Purchase.countDocuments(filter);
        const totalPages = Math.ceil(totalPurchases / limit);

        res.status(200).json({
            success: true,
            data: {
                purchases,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPurchases,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchases',
            error: error.message
        });
    }
};

/**
 * Get purchase by ID
 */
exports.getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('course', 'title price discount')
            .populate('masterClass', 'title price');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        res.status(200).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        console.error('Error fetching purchase:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchase',
            error: error.message
        });
    }
};

/**
 * Update purchase status
 */
exports.updatePurchaseStatus = async (req, res) => {
    try {
        const { status, paymentId } = req.body;
        const purchaseId = req.params.id;

        // Validate status
        const validStatuses = ['pending', 'success', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, success, failed'
            });
        }

        const updateData = { status };
        if (paymentId) {
            updateData.paymentId = paymentId;
        }

        const purchase = await Purchase.findByIdAndUpdate(
            purchaseId,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        // Update user enrollment status if payment is successful
        if (status === 'success') {
            const user = await User.findById(purchase.user._id);
            if (user) {
                if (purchase.purchasetype === 'course') {
                    user.isCourseEnrolled = true;
                } else if (purchase.purchasetype === 'masterclass') {
                    user.isMasterClassEnrolled = true;
                }
                await user.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Purchase status updated successfully',
            data: purchase
        });
    } catch (error) {
        console.error('Error updating purchase status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update purchase status',
            error: error.message
        });
    }
};

/**
 * Get purchase statistics
 */
exports.getPurchaseStats = async (req, res) => {
    try {
        const stats = await Purchase.aggregate([
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    successfulPurchases: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    pendingPurchases: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    failedPurchases: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    averageOrderValue: { $avg: '$amount' }
                }
            }
        ]);

        // Get revenue by purchase type
        const revenueByType = await Purchase.aggregate([
            {
                $group: {
                    _id: '$purchasetype',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);

        // Get monthly revenue for last 12 months
        const monthlyRevenue = await Purchase.aggregate([
            {
                $match: {
                    status: 'success',
                    createdAt: {
                        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalPurchases: 0,
                    totalRevenue: 0,
                    successfulPurchases: 0,
                    pendingPurchases: 0,
                    failedPurchases: 0,
                    averageOrderValue: 0
                },
                revenueByType,
                monthlyRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching purchase statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch purchase statistics',
            error: error.message
        });
    }
};

/**
 * Get purchases by user
 */
exports.getPurchasesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const purchases = await Purchase.find({ user: userId })
            .populate('course', 'title price')
            .populate('masterClass', 'title price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPurchases = await Purchase.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalPurchases / limit);

        res.status(200).json({
            success: true,
            data: {
                purchases,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPurchases,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
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

/**
 * Delete purchase (admin only)
 */
exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Purchase deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting purchase:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete purchase',
            error: error.message
        });
    }
};

/**
 * Export purchases to CSV
 */
exports.exportPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('user', 'name email phone')
            .populate('course', 'title')
            .populate('masterClass', 'title')
            .sort({ createdAt: -1 });

        // Convert to CSV format
        const csvData = purchases.map(purchase => ({
            'Purchase ID': purchase._id,
            'User Name': purchase.user?.name || 'N/A',
            'User Email': purchase.user?.email || 'N/A',
            'User Phone': purchase.user?.phone || 'N/A',
            'Purchase Type': purchase.purchasetype,
            'Course/Class': purchase.course?.title || purchase.masterclass?.title || 'N/A',
            'Amount': purchase.amount,
            'Status': purchase.status,
            'Payment ID': purchase.paymentId || 'N/A',
            'Order ID': purchase.orderId || 'N/A',
            'Created At': purchase.createdAt.toISOString()
        }));

        res.status(200).json({
            success: true,
            data: csvData
        });
    } catch (error) {
        console.error('Error exporting purchases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export purchases',
            error: error.message
        });
    }
};
