const Blog = require('../models/blogModel');

module.exports.addBlogs = async (req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to add blogs' });
        }
        const blog = new Blog(req.body);
        blog.author = req.user.id;
        await blog.save();
        res.status(201).json({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to add blog' });
    }
};

module.exports.getBlogs = async (req, res) => {
    try{
        const blogs = await Blog.find().populate('author', 'firstName lastName email');
        res.status(200).json({ blogs });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get blogs' });
    }
};

module.exports.getBlogById = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id).populate('author', 'firstName lastName email');
        if(!blog){
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get blog' });
    }
};

module.exports.updateBlog = async (req, res) => {
    try{
        console.log(req.body);
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({ error: 'Blog not found' });
        }
        if(req.user.role !== 'admin' || blog.author != req.user.id){
            return res.status(403).json({ error: 'You are not authorized to update this blog' });
        }
        const update = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Blog updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update blog' });
    }
};

module.exports.deleteBlog = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({ error: 'Blog not found' });
        }
        if(req.user.role !== 'admin' || blog.author != req.user.id){
            return res.status(403).json({ error: 'You are not authorized to delete this blog' });
        }
        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Blog deleted successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};