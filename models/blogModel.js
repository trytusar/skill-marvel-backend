const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to the User model
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
},{timestamps: true});

// Define the Blog schema
const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to the User model
        required: true
    },
    comments: [commentSchema], // Array of comments
    tags: [{
        type: String,
        trim: true
    }],
},{timestamps: true});

// Create models
const Blog = mongoose.model('blogs', BlogSchema);

module.exports = Blog;
