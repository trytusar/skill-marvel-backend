const Blog = require('../models/blogModel');
const uploadPaths = require('../utils/uploadPaths');
const getFullUrl = require('../utils/getFullUrl');
const fs = require('fs');
const path = require('path');

module.exports.addBlogs = async (req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to add blogs' });
        }
        if(req.file){
            req.body.image = getFullUrl.getBlogImageUrl(req);
        }

        if (req.body.description) {
            req.body.description = await processInlineImages(req.body.description);
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


module.exports.updateBlog = async (req, res) => {
    try{
        //console.log(req.body);
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({ error: 'Blog not found' });
        }
        //if(req.user.role !== 'admin' || blog.author != req.user.id){
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to update this blog' });
        }
        if(req.file){
            req.body.image = getFullUrl.getBlogImageUrl(req);
        }

        if (req.body.description) {
           // req.body.description = await processInlineImages(req.body.description);
        } 
        const update = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Blog updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update blog' });
    }
};


module.exports.getBlogs = async (req, res) => {
    try{
        const blogs = await Blog.find();
        res.status(200).json({ blogs });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get blogs' });
    }
};

module.exports.getBlogById = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);
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


async function processInlineImages(description) {
    //const base64Regex = /<img.*?src="data:(image\/.*?);base64,(.*?)".*?>/g;

    const base64ImgRegex = /<img[^>]*\s+src=(["'])(data:(image\/[a-zA-Z0-9.+-]+);base64,([^"']+))\1[^>]*>/g;

    // collect matches (matchAll gives iterator)
    const matches = Array.from(description.matchAll(base64ImgRegex));
    if (matches.length === 0) return description;

    let newDescription = description;

    let match;
    while ((match = base64Regex.exec(description)) !== null) {
        console.log('match:', match);
        const mimeType = match[1];
        const base64Data = match[2];

        const fileExt = mimeType.split('/')[1];
        const fileName = `${Date.now()}.${fileExt}`;
        //const filePath = `uploads/blog-inline-images/${fileName}`;
        const filePath = `${uploadPaths.BLOG_INLINE_IMAGE_PATH}/${fileName}`;

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        //const imageUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/blog-images/${fileName}`;

        const imageUrl = getFullUrl.getBlogImageUrl(req, fileName);

        // replace the base64 content with URL image
        description = description.replace(match[0], `<img src="${imageUrl}" />`);
    }

    return description;
}