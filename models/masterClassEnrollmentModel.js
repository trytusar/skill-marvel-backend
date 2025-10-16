const mongoose = require('mongoose');

const masterClassEnrollmentSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  masterClass: { type: mongoose.Schema.Types.ObjectId, ref: 'masterclasses', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }

}, {
    timestamps: true
});

const MasterClassEnrollment = mongoose.model('masterClassEnrollments', masterClassEnrollmentSchema);
module.exports = MasterClassEnrollment;