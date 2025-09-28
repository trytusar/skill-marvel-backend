const mongoose = require('mongoose');
const { Start } = require('twilio/lib/twiml/VoiceResponse');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
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
    masterclassamount:{
        type: Number,
        required: false,
        default: 0
    },
    discount:{
        type: Number,
        required: false,
        default: 0
    },
    StartDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    mode: {
        type: String,
        required: true,
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