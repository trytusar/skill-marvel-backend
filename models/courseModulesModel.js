const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    weeks: String,
    description: String,
    topics: [String],
    skills: [String],
});

const courseModulesSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    modules: [moduleSchema]
}, { timestamps: true });

const CourseModules = mongoose.model('CourseModules', courseModulesSchema);

module.exports = CourseModules;