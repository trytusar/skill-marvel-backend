const User = require('../models/userModel');

async function generateStudentId() {
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
}

module.exports = generateStudentId;