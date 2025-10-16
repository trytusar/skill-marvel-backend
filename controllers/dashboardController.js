const User = require('../models/userModel');
const Instructor = require('../models/instructorModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const Purchase = require('../models/purchaseModel');
const Inquiry = require('../models/inquiryModel');
const ContactUs = require('../models/contactUsModel');
const Enrollment = require('../models/enrollmentModel');
const MasterClassEnrollment = require('../models/masterClassEnrollmentModel');

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



module.exports.getCourseUserCountsAllData = async (req, res) => {
  try {
    const stats = await Enrollment.aggregate([
      {
        $group: {
          _id: "$course",          // group by course ID
          userCount: { $sum: 1 }   // count how many enrollments per course
        }
      },
      {
        $lookup: {
          from: "courses",          // MongoDB collection name (lowercase plural usually)
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          courseName: "$course.title",
          userCount: 1
        }
      }
    ]);

    res.status(200).json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get course user counts" });
  }
};

module.exports.getMasterClassUserCountsAllData = async (req, res) => {
  try {
    const stats = await MasterClassEnrollment.aggregate([
      {
        $group: {
          _id: "$masterClass",     // Group by MasterClass ID
          userCount: { $sum: 1 }   // Count enrollments per MasterClass
        }
      },
      {
        $lookup: {
          from: "masterclasses",    // MongoDB collection name for masterclasses
          localField: "_id",
          foreignField: "_id",
          as: "masterClass"
        }
      },
      { $unwind: "$masterClass" },
      {
        $project: {
          _id: 0,
          masterClassId: "$_id",
          masterClassName: "$masterClass.title",
          userCount: 1
        }
      }
    ]);

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Error getting masterclass user counts:", error);
    res.status(500).json({ error: "Failed to get masterclass user counts" });
  }
};

module.exports.getCourseUserCounts = async (req, res) => {
  try {
    const { year } = req.query;
    const matchStage = {};

    // ✅ If year is passed, filter by createdAt within that year
    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [];

    // Add match stage only if year filter exists
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: "$course",           // group by course ID
          userCount: { $sum: 1 }    // count enrollments per course
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          courseName: "$course.title",
          userCount: 1
        }
      }
    );

    const stats = await Enrollment.aggregate(pipeline);

    res.status(200).json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get course user counts" });
  }
};

module.exports.getMasterClassUserCounts = async (req, res) => {
  try {
    const { year } = req.query;
    const pipeline = [];

    // ✅ If year is present, filter enrollments by year of enrolledAt
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      pipeline.push({
        $match: {
          enrolledAt: {
            $gte: startOfYear,
            $lt: endOfYear
          }
        }
      });
    }

    // Group by masterClass and count
    pipeline.push({
      $group: {
        _id: "$masterClass",
        userCount: { $sum: 1 }
      }
    });

    // Join with masterclasses collection
    pipeline.push({
      $lookup: {
        from: "masterclasses",
        localField: "_id",
        foreignField: "_id",
        as: "masterClass"
      }
    });

    pipeline.push({ $unwind: "$masterClass" });

    // Final shape of response
    pipeline.push({
      $project: {
        _id: 0,
        masterClassId: "$_id",
        masterClassName: "$masterClass.title",
        userCount: 1
      }
    });

    const stats = await MasterClassEnrollment.aggregate(pipeline);
    res.status(200).json({ stats });

  } catch (error) {
    console.error("Error getting masterclass user counts:", error);
    res.status(500).json({ error: "Failed to get masterclass user counts" });
  }
};