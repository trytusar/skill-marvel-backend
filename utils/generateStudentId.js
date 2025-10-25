const User = require('../models/userModel');
const Counter = require('../models/counterModel');

/*
async function generateStudentIdOld() {
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

// generateStudentId.js
async function generateStudentId() {
  const PREFIX = 'STU';
  const DIGIT_LENGTH = 6;

  const counter = await Counter.findOneAndUpdate(
    { name: 'studentId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const nextNumber = counter.seq;
  return `${PREFIX}${nextNumber.toString().padStart(DIGIT_LENGTH, '0')}`;
}


module.exports = generateStudentId;