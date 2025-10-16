const Banner = require('../models/bannerModel');
const getFullUrl = require('../utils/getFullUrl');
const fs = require('fs');
const path = require('path');

module.exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const { category } = req.body;
    const imageUrl = getFullUrl.getBannerImageUrl(req, req.file.filename);
    const banner = new Banner({ image: imageUrl, category, isActive: true });
    await banner.save();
    res.status(201).json({ banner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload banner' });
  }
};

module.exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    console.log(id, isActive);
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    const banner = await Banner.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.status(200).json({ banner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner status' });
  }
};

module.exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().select('image category isActive createdAt _id');
    res.status(200).json({ banners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

module.exports.getBannersByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const banners = await Banner.find({ category:category, isActive:true }).select('image _id');
    res.status(200).json({ banners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners by category' });
  }
};

module.exports.deleteBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    // Remove image file from file system
    if (banner.image) {
      // Extract relative path from image URL
      const imagePath = banner.image.split(req.get('host'))[1];
      const filePath = path.join(__dirname, '..', imagePath);
      console.log('Deleting file:', filePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log('File deletion failed for path:', filePath, 'error:', err);
        }
      });
    }

    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};