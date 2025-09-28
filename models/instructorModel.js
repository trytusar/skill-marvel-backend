const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    assignedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    expertise: {
        type: String,
        required: true,
        enum: ['ReactJS', 'JavaScript', 'Python', 'NodeJS', 'DevOps', 'AI/ML', 'Data Science']
    }
}, {
    timestamps: true
});

const Instructor = mongoose.model('instructors', instructorSchema);
module.exports = Instructor;