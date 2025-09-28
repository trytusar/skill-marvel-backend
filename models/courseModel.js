const mongoose = require('mongoose');
const { Start } = require('twilio/lib/twiml/VoiceResponse');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'instructors',
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    tag: {
        type: String,
        required: true,
        enum: ['Technical', 'Design', 'Finance', 'Marketing', 'Soft Skills', 'Other']
    },    
    description: {
        type: String,   
        required: true
    },
    htmldescription: {
        type: String,
        required: false
    },
    price:{
        type: Number,
        required: true
    },  
    discountPrice:{
        type: Number,
        required: true
    },  
    image: {
        type: String,
        required: true
    },  
    discount:{
        type: Number,
        required: false,
        default: 0
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    mode: {
        type: String,
        required: false,
        enum: ['online', 'offline', 'hybrid'],
        default: 'online'
    },
    venue:{
        type: String,
        required: false
    },
    isSoftDelete: {
        type: Boolean,
        default: false
    },
});

const Course = mongoose.model('courses', courseSchema);
module.exports = Course;