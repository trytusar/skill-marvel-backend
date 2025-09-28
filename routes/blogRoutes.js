const express = require('express');
const { addBlogs, getBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const router = express.Router();

// Route to add a new blog
router.post('/', auth.authMiddleware, addBlogs);

// Route to get all blogs
router.get('/', getBlogs);

// Route to get a single blog by ID
router.get('/:id', getBlogById);

// Route to update a blog by ID
router.put('/:id', auth.authMiddleware, updateBlog);

// Route to delete a blog by ID
router.delete('/:id', auth.authMiddleware, deleteBlog);

module.exports = router;
