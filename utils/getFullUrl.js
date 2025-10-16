const uploadPaths = require('./uploadPaths');

function getFullUrl(req, relativePath) {
  return `${req.protocol}://${req.get('host')}${relativePath}`;
}

function getMasterClassImageUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.MASTER_CLASS_IMAGE}/${req.file.filename}`;
}

function getCourseImageUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.COURSE_IMAGE}/${req.file.filename}`;
}

function getInstructorImageUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.INSTRUCTOR_IMAGE}/${req.file.filename}`;
}

function getUserImageUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.USER_IMAGE}/${req.file.filename}`;
}

function getBannerImageUrl(req, filename) {
  const uploadPaths = require('./uploadPaths');
  return `${req.protocol}://${req.get('host')}${uploadPaths.BANNER_IMAGE}/${filename}`;
}

 
module.exports = {
  getMasterClassImageUrl,
  getCourseImageUrl,
  getInstructorImageUrl,
  getUserImageUrl,
  getFullUrl,
  getBannerImageUrl
};

/*
const getFullUrl = require('../utils/getFullUrl');
const uploadPaths = require('../utils/uploadPaths');
// ...existing code...
if (req.file) {
    masterClass.image = getFullUrl(req, `${uploadPaths.MASTER_CLASS_IMAGE}/${req.file.filename}`);
}
*/