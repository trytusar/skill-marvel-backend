// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');   
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const courseRoutes = require('./routes/courseRoutes');


const app = express();

// Middleware
app.use(cors(
    {
        origin: '*',
        credentials: true
    }
));

app.use(express.urlencoded({ extended: true }));  // For handling form data
app.use(express.json());  // For handling JSON data
app.use('/uploads', express.static('uploads'));  // For serving files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/course', courseRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));