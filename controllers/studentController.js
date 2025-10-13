const User = require('../models/userModel');
const Course = require('../models/courseModel');
const csv = require('csvtojson');
const fs = require('fs');
const Enrollment = require('../models/enrollmentModel');
const getFullUrl = require('../utils/getFullUrl');

module.exports.listAllStudents = async (req, res) => {
  try {
    /*const students = await User.find({ role: 'user' })
      .select('profilePicture firstName lastName studentId phoneNumber email enrolledCourse status lastLogin')
      .populate('enrolledCourse', 'title'); // assuming enrolledCourse is an array of course IDs */

       const users = await User.find({ role: 'user' })
      .select('profilePicture firstName lastName phoneNumber email status lastLogin');

    // For each user, fetch their enrolled courses from Enrollment
    const students = await Promise.all(users.map(async (user) => {
      const enrollments = await Enrollment.find({ user: user._id }).populate('course', 'title');
      return {
        ...user.toObject(),
        enrolledCourses: enrollments.map(e => e.course ? e.course.title : null)
      };
    }));

    res.status(200).json({ students });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};
module.exports.listAllSignUps = async (req, res) => {
  try {
    const users = await User.find({ addedByAdmin: false })
      .select('profilePicture firstName lastName email phoneNumberNumber createdAt lastLogin');

    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
module.exports.listAllEnrolledUsers = async (req, res) => {
  try {
    const users = await User.find({ addedByAdmin: true })
      .select('profilePicture firstName lastName email phoneNumberNumber createdAt lastLogin');

    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports.addStudent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to add student' });
    }
    if(req.file){
      req.body.profilePicture = getFullUrl.getUserImageUrl(req);
    }
    console.log('req.body:', req.body);

    const { firstName, lastName, email, phoneNumber, gender, enrolledCourse, profilePicture } = req.body;

    const student = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      //enrolledCourse,
      profilePicture,
      role: 'user',
      isAddedByAdmin: true
    });
    

    const insertedUsers = await student.save();
    if(enrolledCourse){
      const enrollment = new Enrollment({ user: insertedUsers._id, course: enrolledCourse });
      await enrollment.save();
    }
    
    res.status(201).json({ student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add student' });
  }
};



module.exports.updateStudent = async (req, res) => {
    try{
       
        if(req.file){
            req.body.profilePicture = getFullUrl.getUserImageUrl(req);
        } 

        console.log('Update req.body:', req.body);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // return updated doc
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        let enrolledCourse = req.body.enrolledCourse;
        if(enrolledCourse){
          // Check if enrollment already exists for this user and course
          const existingEnrollment = await Enrollment.findOne({ user: updatedUser._id, course: enrolledCourse });
          if (!existingEnrollment) {
            const enrollment = new Enrollment({ user: updatedUser._id, course: enrolledCourse });
            await enrollment.save();
          }
        }
            
        res.status(200).json({ message: 'User profile updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};


module.exports.bulkEnrollStudents = async (req, res) => {
  try {
    const filePath = req.file.path; // assuming multer is used for file upload
    const studentsArray = await csv().fromFile(filePath);

    // Map CSV fields to User model
    const usersToInsert = studentsArray.map(s => ({
      firstName: s['First Name'],
      lastName: s['Last Name'],
      email: s['Email'],
      phoneNumber: s['Phone Number'],
      gender: s['Gender'],
      profilePicture: s['Profile Picture'],
      role: 'user',
      isAddedByAdmin: true
    }));

    //await User.insertMany(usersToInsert);

    //const enrollment = new Enrollment({ user: userId, course: courseId });
    //await enrollment.save();

    const insertedUsers = await User.insertMany(usersToInsert);

    for (let i = 0; i < insertedUsers.length; i++) {
        const userId = insertedUsers[i]._id;
        const courseName = studentsArray[i]['Course']; // 'course' field from CSV

        // Find the course by name/title
        const course = await Course.findOne({ title: courseName });
        if (course) {
            const enrollment = new Enrollment({ user: userId, course: course._id });
            await enrollment.save();
        }
    }

    res.status(201).json({ message: 'Bulk students enrolled successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Bulk enroll failed' });
  }
};

module.exports.getStudentById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by ID
    const user = await User.findById(userId).select('-__v -createdAt -updatedAt -graphyUserId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch enrolled courses for this user
    const enrollments = await Enrollment.find({ user: user._id }).populate('course', 'title');

    const studentDetails = {
      ...user.toObject(),
      enrolledCourses: enrollments.map(e => e.course ? e.course.title : null)
    };

    res.status(200).json({ student: studentDetails });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
};