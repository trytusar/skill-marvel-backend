const Enrollment = require('../models/enrollmentModel');
const MasterClassEnrollment = require('../models/masterClassEnrollmentModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const { isValid } = require('./util');
const generateStudentId = require('./generateStudentId');

/**
 * Enroll user in a course if not already enrolled
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Object} - Enrollment result
 */
const enrollUserInCourse = async (userId, courseId) => {
    try {
        // Validate inputs
        if (!isValid(userId) || !isValid(courseId)) {
            return {
                success: false,
                message: 'User ID and Course ID are required'
            };
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return {
                success: false,
                message: 'Course not found'
            };
        }

        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({ 
            user: userId, 
            course: courseId 
        });

        if (existingEnrollment) {
            return {
                success: true,
                message: 'User is already enrolled in this course',
                enrollment: existingEnrollment,
                alreadyEnrolled: true
            };
        }

        // Create new enrollment
        const enrollment = new Enrollment({ 
            user: userId, 
            course: courseId 
        });
        await enrollment.save();

        // Generate student ID if not present
        if (!user.studentId) {
            user.studentId = await generateStudentId();
        }

        // Update user's enrollment status
        user.isCourseEnrolled = true;
        await user.save();

        return {
            success: true,
            message: 'User successfully enrolled in course',
            enrollment: enrollment,
            alreadyEnrolled: false
        };

    } catch (error) {
        console.error('Error enrolling user in course:', error);
        return {
            success: false,
            message: 'Failed to enroll user in course',
            error: error.message
        };
    }
};

/**
 * Enroll user in a masterclass if not already enrolled
 * @param {string} userId - User ID
 * @param {string} masterClassId - MasterClass ID
 * @returns {Object} - Enrollment result
 */
const enrollUserInMasterClass = async (userId, masterClassId) => {
    try {
        // Validate inputs
        if (!isValid(userId) || !isValid(masterClassId)) {
            return {
                success: false,
                message: 'User ID and MasterClass ID are required'
            };
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Check if masterclass exists
        const masterclass = await MasterClass.findById(masterClassId);
        if (!masterclass) {
            return {
                success: false,
                message: 'Masterclass not found'
            };
        }

        // Check if enrollment already exists
        const existingEnrollment = await MasterClassEnrollment.findOne({ 
            user: userId, 
            masterclass: masterClassId 
        });

        if (existingEnrollment) {
            return {
                success: true,
                message: 'User is already enrolled in this masterclass',
                enrollment: existingEnrollment,
                alreadyEnrolled: true
            };
        }

        // Create new enrollment
        const enrollment = new MasterClassEnrollment({ 
            user: userId, 
            masterclass: masterClassId 
        });
        await enrollment.save();

        // Generate student ID if not present
        if (!user.studentId) {
            user.studentId = await generateStudentId();
        }

        // Update user's enrollment status
        user.isMasterClassEnrolled = true;
        await user.save();

        return {
            success: true,
            message: 'User successfully enrolled in masterclass',
            enrollment: enrollment,
            alreadyEnrolled: false
        };

    } catch (error) {
        console.error('Error enrolling user in masterclass:', error);
        return {
            success: false,
            message: 'Failed to enroll user in masterclass',
            error: error.message
        };
    }
};

/**
 * Check if user is enrolled in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Object} - Enrollment status
 */
const isUserEnrolledInCourse = async (userId, courseId) => {
    try {
        if (!isValid(userId) || !isValid(courseId)) {
            return {
                success: false,
                enrolled: false,
                message: 'User ID and Course ID are required'
            };
        }

        const enrollment = await Enrollment.findOne({ 
            user: userId, 
            course: courseId 
        });

        return {
            success: true,
            enrolled: !!enrollment,
            enrollment: enrollment,
            message: enrollment ? 'User is enrolled' : 'User is not enrolled'
        };

    } catch (error) {
        console.error('Error checking course enrollment:', error);
        return {
            success: false,
            enrolled: false,
            message: 'Failed to check enrollment status',
            error: error.message
        };
    }
};

/**
 * Check if user is enrolled in a masterclass
 * @param {string} userId - User ID
 * @param {string} masterClassId - MasterClass ID
 * @returns {Object} - Enrollment status
 */
const isUserEnrolledInMasterClass = async (userId, masterClassId) => {
    try {
        if (!isValid(userId) || !isValid(masterClassId)) {
            return {
                success: false,
                enrolled: false,
                message: 'User ID and MasterClass ID are required'
            };
        }

        const enrollment = await MasterClassEnrollment.findOne({ 
            user: userId, 
            masterclass: masterClassId 
        });

        return {
            success: true,
            enrolled: !!enrollment,
            enrollment: enrollment,
            message: enrollment ? 'User is enrolled' : 'User is not enrolled'
        };

    } catch (error) {
        console.error('Error checking masterclass enrollment:', error);
        return {
            success: false,
            enrolled: false,
            message: 'Failed to check enrollment status',
            error: error.message
        };
    }
};

/**
 * Get all courses enrolled by user
 * @param {string} userId - User ID
 * @returns {Object} - User's course enrollments
 */
const getUserCourseEnrollments = async (userId) => {
    try {
        if (!isValid(userId)) {
            return {
                success: false,
                enrollments: [],
                message: 'User ID is required'
            };
        }

        const enrollments = await Enrollment.find({ user: userId })
            .populate('course', 'title description price image')
            .sort({ createdAt: -1 });

        return {
            success: true,
            enrollments: enrollments,
            count: enrollments.length,
            message: `Found ${enrollments.length} course enrollments`
        };

    } catch (error) {
        console.error('Error getting user course enrollments:', error);
        return {
            success: false,
            enrollments: [],
            message: 'Failed to get course enrollments',
            error: error.message
        };
    }
};

/**
 * Get all masterclasses enrolled by user
 * @param {string} userId - User ID
 * @returns {Object} - User's masterclass enrollments
 */
const getUserMasterClassEnrollments = async (userId) => {
    try {
        if (!isValid(userId)) {
            return {
                success: false,
                enrollments: [],
                message: 'User ID is required'
            };
        }

        const enrollments = await MasterClassEnrollment.find({ user: userId })
            .populate('masterclass', 'title description price image')
            .sort({ createdAt: -1 });

        return {
            success: true,
            enrollments: enrollments,
            count: enrollments.length,
            message: `Found ${enrollments.length} masterclass enrollments`
        };

    } catch (error) {
        console.error('Error getting user masterclass enrollments:', error);
        return {
            success: false,
            enrollments: [],
            message: 'Failed to get masterclass enrollments',
            error: error.message
        };
    }
};

module.exports = {
    enrollUserInCourse,
    enrollUserInMasterClass,
    isUserEnrolledInCourse,
    isUserEnrolledInMasterClass,
    getUserCourseEnrollments,
    getUserMasterClassEnrollments
};
