const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
});

module.exports = mongoose.model('enrollments', enrollmentSchema);