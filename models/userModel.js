// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    phoneNumber: { type: String, required: true, unique: true },    
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String },
    bio: { type: String },    
    experience: [
        {
            company: { type: String },
            role: { type: String },
            duration: { type: String },
            description: { type: String }
        }
    ],
    socialLinks: {
        linkedIn: { type: String },
        github: { type: String },
        twitter: { type: String },
        website: { type: String }
    },
    studentId: { type: String, required: false },
    profilePicture: { type: String, required: false },
    referralCode: { type: String },
    referredBy: { type: String }, // If referred by someone else, store their referral code
    graphyUserId: { type: String, default: null }, // Graphy API user ID
    isCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    lastLogin: {  type: Date, default: null },
    isAddedByAdmin: { type: Boolean, default: false  }, // who added this user (admin/signup)
    isCourseEnrolled: { type: Boolean, default: false  }, // If course is added/assigned to user
    isMasterClassEnrolled: { type: Boolean, default: false  }, // If master class is added/assigned to user   

}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);