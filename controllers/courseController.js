const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // For verifying the callback signature
require('dotenv').config();
const axios = require('axios');
const getFullUrl = require('../utils/getFullUrl');
const generateStudentId = require('../utils/generateStudentId');
const {calculateCoursePrice} = require('../utils/calculatePrice');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.addCourse = async (req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to add courses' });
        }
        const course = new Course(req.body);
        if(req.file){
            //course.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            course.image = getFullUrl.getCourseImageUrl(req);
        }

        if ( (course.discount && course.discount > 0) 
            &&  (course.discountAmount && course.discountAmount > 0)) {                
            return res.status(401).json({ error: 'Provide non zero value for only one of them: discount or discountAmount' });              
        }

        const savedCourse = await course.save();
        res.status(201).json({ savedCourse });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to add course' });
    }
};

module.exports.updateCourse = async (req, res) => {
    try{
        const course = await Course.findById(req.params.id);
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error: 'You are not authorized to update this course' });
        }
        if(req.file){
            //req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            req.body.image = getFullUrl.getCourseImageUrl(req);
        }

        if ((course.discount && course.discount > 0) 
            &&  (course.discountAmount && course.discountAmount > 0)) {                
            return res.status(401).json({ error: 'Provide non zero value for only one of them: discount or discountAmount' });              
        }
        const update = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Course updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

module.exports.getCourses = async (req, res) => {
    try{
        const courses = await Course.find({ isSoftDelete: false })
        .select('-__v -isSoftDelete -createdAt -updatedAt').populate('instructor', "fullName -_id");

        /*const coursesWithPrice = courses.map(course => {
            const priceInfo = calculateCoursePrice(course);
            console.log('priceInfo', priceInfo);
            return {
              ...course.toObject(),
              priceInfo
            };
          });*/

          courses.forEach(course => {
            const priceInfo = calculateCoursePrice(course, 0);
            console.log('priceInfo:', priceInfo);
            course.set('priceInfo', priceInfo, { strict: false }); // 👈 allows adding virtual fields
          });

        res.status(200).json({ courses: courses });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get courses' });
    }
};

module.exports.getCourseById = async (req, res) => {
    try{
        const course = await Course.findOne({ _id: req.params.id, isSoftDelete: false }).populate('instructor');
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }

        const priceInfo = calculateCoursePrice(course, 0); 
        const courseObj = course.toObject();
        // Add priceInfo to object
        courseObj.priceInfo = priceInfo;
          

        res.status(200).json({ course: courseObj });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get course' });
    }
};

module.exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this course' });
        }
        course.isSoftDelete = true;
        await course.save();
        res.status(200).json({ message: 'Course soft deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to soft delete course' });
    }
};
