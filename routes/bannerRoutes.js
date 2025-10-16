const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const uploadPaths = require('../utils/uploadPaths');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `.${uploadPaths.BANNER_IMAGE}/`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/upload-banner', auth.authMiddleware, upload.single('image'), bannerController.uploadBanner);
router.get('/get-banners', bannerController.getBanners);
router.patch('/update-banner-status/:id', auth.authMiddleware, bannerController.updateBannerStatus);
router.get('/get-banners-by-category', bannerController.getBannersByCategory);
router.delete('/delete-banner/:id', auth.authMiddleware, bannerController.deleteBannerById);


module.exports = router;