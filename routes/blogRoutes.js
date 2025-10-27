const express = require('express');
const { addBlogs, getBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const auth = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware to verify JWT
const router = express.Router();
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `.${uploadPaths.BLOG_IMAGE_PATH}/`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route to add a new blog
router.post('/add-blog', auth.authMiddleware, upload.single('image'), addBlogs);

// Route to update a blog by ID
router.put('/update-blog/:id', auth.authMiddleware, upload.single('image'),  updateBlog);

// Route to get all blogs
router.get('/get-blogs', getBlogs);

// Route to get a single blog by ID
router.get('/get-blog/:id', getBlogById);

// Route to delete a blog by ID
router.delete('/delete-blog/:id', auth.authMiddleware, deleteBlog);

module.exports = router;
