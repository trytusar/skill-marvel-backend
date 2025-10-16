const User = require('../models/userModel');
const Instructor = require('../models/instructorModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const Purchase = require('../models/purchaseModel');
const Inquiry = require('../models/inquiryModel');
const ContactUs = require('../models/contactUsModel');

module.exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Enrolled (total purchases)
    //const totalEnrolled = await Purchase.countDocuments();

    //const courses = await Course.find({}, 'noOfEnrollements');
    //const totalEnrolled = courses.reduce((sum, course) => sum + (course.noOfEnrollements || 0), 0);

    const courses = await User.find({}, 'isCourseEnrolled');
    const totalEnrolled = courses.reduce((sum, course) => sum + (course.isCourseEnrolled ? 1 : 0), 0);

    //const masterClasses = await MasterClass.find({}, 'noOfRegisteredUsers');
    //const totalMasterClassRegistered = masterClasses.reduce((sum, masterClass) => sum + (masterClass.noOfRegisteredUsers || 0), 0);

    const masterClasses = await User.find({}, 'isMasterClassEnrolled');
    const totalMasterClassRegistered = masterClasses.reduce((sum, masterClass) => sum + (masterClass.isMasterClassEnrolled ? 1 : 0), 0);

    // 2. Total Master Class
    const totalMasterClasses = await MasterClass.countDocuments();

    // 2. Total Instructor
    const totalInstructors = await Instructor.countDocuments();

    // 3. New Reg (users registered in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newReg = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // 4. Total Courses
    const totalCourses = await Course.countDocuments();

    // 5. Total Revenue (sum of all purchases)
    const purchases = await Purchase.find();
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 6. Total Students (users with role 'student')
    const totalStudents = await User.countDocuments({ role: 'user' });

    // 7. Active Students (students with status 'active')
    const activeStudents = await User.countDocuments({ role: 'user', isActive: true });

    // 8. Recent SignUps (last 5 users)
    const recentSignUps = await User.find({addedByAdmin: false}).sort({ createdAt: -1 })
        .select('firstName lastName email phoneNumberNumber createdAt lastLogin')
        .limit(5);

    // 9. Total Inquiry
    const totalInquiry = await Inquiry.countDocuments();

    // 10. Total Contact
    const totalContactUs = await ContactUs.countDocuments();

    // 11. Active and close status number for Inquiries and Contacts
    /*const activeInquiry = await Inquiry.countDocuments({ status: 'active' });
    const closedInquiry = await Inquiry.countDocuments({ status: 'closed' });
    const activeContact = await ContactUs.countDocuments({ status: 'active' });
    const closedContact = await ContactUs.countDocuments({ status: 'closed' });*/
    // 11. Active and close status number for Inquiries and Contacts
    const activeInquiry = await Inquiry.countDocuments({ isRegistered: false });
    const closedInquiry = await Inquiry.countDocuments({ isRegistered: true });
    const activeContact = await ContactUs.countDocuments({ isResolved: false });
    const closedContact = await ContactUs.countDocuments({ isResolved: true });

    res.status(200).json({
      totalEnrolled,
      totalMasterClassRegistered,
      totalInstructors,
      newReg,
      totalCourses,
      totalMasterClasses,
      totalRevenue,
      totalStudents,
      activeStudents,
      recentSignUps,
      totalInquiry,
      totalContactUs,
      inquiryStatus: { active: activeInquiry, closed: closedInquiry },
      contactStatus: { active: activeContact, closed: closedContact }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};