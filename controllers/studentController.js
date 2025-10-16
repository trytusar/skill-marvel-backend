const User = require('../models/userModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const csv = require('csvtojson');
const fs = require('fs');
const Enrollment = require('../models/enrollmentModel');
const MasterClassEnrollment = require('../models/masterClassEnrollmentModel');
const getFullUrl = require('../utils/getFullUrl');
const generateStudentId = require('../utils/generateStudentId');

module.exports.listAllStudents = async (req, res) => {
  try {
    /*const students = await User.find({ role: 'user' })
      .select('profilePicture firstName lastName studentId phoneNumber email enrolledCourse status lastLogin')
      .populate('enrolledCourse', 'title'); // assuming enrolledCourse is an array of course IDs */

       const users = await User.find({ role: 'user' })
      .select('profilePicture firstName lastName phoneNumber email status createdAt lastLogin');

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
    const users = await User.find({ isAddedByAdmin: false })
      .select('profilePicture firstName lastName email phoneNumber createdAt lastLogin');

    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports.listAllEnrolledUsers = async (req, res) => {
  try {
    const users = await User.find({ isCourseEnrolled: true })
      .select('studentId profilePicture firstName lastName email phoneNumber createdAt lastLogin isActive');

    const students = await Promise.all(users.map(async (user) => {
      const enrollments = await Enrollment.find({ user: user._id }).populate('course', 'title price');
      console.log('Enrollments for user', user._id, enrollments);
      return {
        ...user.toObject(),
        enrolledCourses: enrollments
          .filter(e => e.course) // Remove entries with no course
          .map(e => ({
            title: e.course.title,
            isFree: e.course.isFree,
            price: e.course.price
          }))
      };
    }));
    
      /*
      const users = await User.find({
        $or: [
          { isCourseEnrolled: true },
          { isMasterClassEnrolled: true }
        ]
      }).select('profilePicture firstName lastName email phoneNumber createdAt lastLogin');
      */


    res.status(200).json({ students });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


module.exports.listAllMasterClassEnrolledUsers = async (req, res) => {
  try {
    const users = await User.find({ isMasterClassEnrolled: true })
      .select('studentId profilePicture firstName lastName email phoneNumber createdAt lastLogin isActive');

    const students = await Promise.all(users.map(async (user) => {
      const enrollments = await MasterClassEnrollment.find({ user: user._id }).populate('masterClass', 'title price');
      return {
        ...user.toObject(),
         enrolledMasterClasses: enrollments
          .filter(e => e.masterClass) // Remove entries with no masterClass
          .map(e => ({
            title: e.masterClass.title,
            isFree: e.masterClass.isFree,
            price: e.masterClass.price
          }))
      };
    }));

    res.status(200).json({ students });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


/** Auto-generate studentId */
/*async function generateStudentId() {
  const PREFIX = 'STU';
  const DIGIT_LENGTH = 6;
  const lastStudent = await User.findOne({ studentId: { $regex: new RegExp(`^${PREFIX}\\d{${DIGIT_LENGTH}}$`) } })
    .sort({ createdAt: -1 })
    .select('studentId');
  let nextNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    nextNumber = parseInt(lastStudent.studentId.replace(PREFIX, ''), 10) + 1;
  }
  return `${PREFIX}${nextNumber.toString().padStart(DIGIT_LENGTH, '0')}`;
}*/

module.exports.addStudent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to add student' });
    }
    if(req.file){
      req.body.profilePicture = getFullUrl.getUserImageUrl(req);
    }
    console.log('req.body:', req.body);

    const { firstName, lastName, email, phoneNumber, gender, enrolledCourse, enrolledMasterClass, profilePicture } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Check if phoneNumber already exists
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(409).json({ error: 'Phone number already exists' });
    }
 
   const studentId = await generateStudentId();

    const student = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,     
      profilePicture,
      role: 'user',
      isAddedByAdmin: true,
      studentId,
      isCompleted: true
    });
    

    const insertedUser = await student.save();
    if(enrolledCourse){
      const enrollment = new Enrollment({ user: insertedUser._id, course: enrolledCourse });
      await enrollment.save();

      // Update user's isCourseEnrolled flag to true
      insertedUser.isCourseEnrolled = true;
      await insertedUser.save();
    }
    if(enrolledMasterClass){
      const masterClassEnrollment = new MasterClassEnrollment({ user: insertedUser._id, masterClass: enrolledMasterClass });
      await masterClassEnrollment.save(); 
      // Update user's isMasterClassEnrolled flag to true
      insertedUser.isMasterClassEnrolled = true;
      await insertedUser.save();     
    }
    
    res.status(201).json({ insertedUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add student' });
  }
};



module.exports.updateStudent = async (req, res) => {
    try{

      if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'You are not authorized to add student' });
      }
       
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

            // Update user's isCourseEnrolled flag to true
            updatedUser.isCourseEnrolled = true;
            await updatedUser.save();
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
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to add student' });
    }
    const filePath = req.file.path; // assuming multer is used for file upload
    const studentsArray = await csv().fromFile(filePath);

    // Map CSV fields to User model fields  
    const usersToInsert = await Promise.all(
      studentsArray.map(async (s) => ({
        firstName: s['First Name'],
        lastName: s['Last Name'],
        email: s['Email'],
        phoneNumber: s['Phone Number'],
        gender: s['Gender'],
        profilePicture: s['Profile Picture'],
        role: 'user',
        isAddedByAdmin: true,
        isCompleted: true,
        studentId: await generateStudentId()
      }))
    );

    const insertedUsers = await User.insertMany(usersToInsert);

    for (let i = 0; i < insertedUsers.length; i++) {
        const userId = insertedUsers[i]._id;
        const courseName = studentsArray[i]['Course']; // 'course' field from CSV

        // Find the course by name/title
        const course = await Course.findOne({ title: courseName });
        if (course) {
            const enrollment = new Enrollment({ user: userId, course: course._id });
            await enrollment.save();

            // Update user's isCourseEnrolled flag to true
            insertedUsers[i].isCourseEnrolled = true;
            await insertedUsers[i].save();            
        }
    }

    res.status(201).json({ message: 'Bulk students enrolled successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Bulk enroll failed' });
  }
};

module.exports.getStudentDetailsById = async (req, res) => {
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

module.exports.getDetailsByStudentId = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find user by studentId
    const user = await User.findOne({ studentId }).select('-__v -createdAt -updatedAt -graphyUserId');

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