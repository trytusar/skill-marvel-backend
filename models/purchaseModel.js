const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        required: false
    },
    masterclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'masterclasses',
        required: false
    },
    purchasetype:{
        type: String,
        required: true,
        enum: ['enroll', 'masterclass']
    },
    amount: {
        type: Number,
        required: true
    },
    masterClassAmount:{
        type: Number,
        required: false,
        default: 0
    },
    sessionToken: {
        type: String,
        required: false
    },
    orderId: {
        type: String,
        required: false
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentMode: {
        type: String,
        default: 'online',
        enum: ['cash', 'online']
    },
    paymentResponse: {
        type: Object,
        required: false
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'failed']
    }
}, { timestamps: true });

const Purchase = mongoose.model('purchases', purchaseSchema);

module.exports = Purchase;