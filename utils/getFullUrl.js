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

function getCourseSyllabusUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.COURSE_SYLLABUS_PATH}/${req.file.filename}`;
}

function getMasterClassSyllabusUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.MASTERCLASS_SYLLABUS_PATH}/${req.file.filename}`;
}

function getBlogImageUrl(req) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.BLOG_IMAGE_PATH}/${req.file.filename}`;
}

function getBlogInlineImageUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}${uploadPaths.BLOG_INLINE_IMAGE_PATH}/${filename}`;
}
 
module.exports = {
  getMasterClassImageUrl,
  getCourseImageUrl,
  getInstructorImageUrl,
  getUserImageUrl,
  getFullUrl,
  getBannerImageUrl,
  getCourseSyllabusUrl,
  getMasterClassSyllabusUrl,
  getBlogImageUrl,
  getBlogInlineImageUrl
};

/*
const getFullUrl = require('../utils/getFullUrl');
const uploadPaths = require('../utils/uploadPaths');
// ...existing code...
if (req.file) {
    masterClass.image = getFullUrl(req, `${uploadPaths.MASTER_CLASS_IMAGE}/${req.file.filename}`);
}
*/