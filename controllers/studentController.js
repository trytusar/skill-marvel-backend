const User = require('../models/userModel');
const Course = require('../models/courseModel');
const csv = require('csvtojson');
const fs = require('fs');
const Enrollment = require('../models/enrollmentModel');

module.exports.listAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'user' })
      .select('profilePicture firstName lastName studentId phoneNumber email enrolledCourse status lastLogin')
      .populate('enrolledCourse', 'title'); // assuming enrolledCourse is an array of course IDs

    res.status(200).json({ students });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};
module.exports.listAllSignUps = async (req, res) => {
  try {
    const users = await User.find({ addedByAdmin: false })
      .select('firstName lastName email phoneNumberNumber createdAt lastLogin');

    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
module.exports.listAllAddedUsers = async (req, res) => {
  try {
    const users = await User.find({ addedByAdmin: true })
      .select('firstName lastName email phoneNumberNumber createdAt lastLogin');

    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
module.exports.addStudent = async (req, res) => {
  try {
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
      addedByAdmin: true
    });
    const insertedUsers = await student.save();
    const enrollment = new Enrollment({ user: insertedUsers._id, course: enrolledCourse });
    await enrollment.save();

    res.status(201).json({ student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add student' });
  }
};


module.exports.bulkEnrollStudents = async (req, res) => {
  try {
    const filePath = req.file.path; // assuming multer is used for file upload
    const studentsArray = await csv().fromFile(filePath);

    // Map CSV fields to User model
    const usersToInsert = studentsArray.map(s => ({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phoneNumber: s.phoneNumber,
      gender: s.gender,
      //enrolledCourse: s['course'],
      profilePicture: s.profilePicture,
      role: 'user',
      addedByAdmin: true
    }));

    //await User.insertMany(usersToInsert);

    //const enrollment = new Enrollment({ user: userId, course: courseId });
    //await enrollment.save();

    const insertedUsers = await User.insertMany(usersToInsert);

    for (let i = 0; i < insertedUsers.length; i++) {
        const userId = insertedUsers[i]._id;
        const courseName = studentsArray[i].course; // 'course' field from CSV

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