const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);