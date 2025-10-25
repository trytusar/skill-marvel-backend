const Instructor = require('../models/instructorModel');
const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');
const getFullUrl = require('../utils/getFullUrl');
const {isValid, isValidNumber} = require('../utils/util');


exports.addInstructor = async (req, res) => {
    try {
        const { fullName, email, phone, assignedCourse, assignedMasterClass, yearsOfExperience, expertise } = req.body;
        let profilePicture = '';
        if (req.file) {
            //profilePicture = req.file.path;        
            //profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            profilePicture = getFullUrl.getInstructorImageUrl(req);

        }

        // Process assignedCourse - convert empty string to undefined
        let processedAssignedCourse = assignedCourse;
        if (isValid(assignedCourse)) {
            console.log('-----------assignedCourse:', assignedCourse);
            const course = await Course.findById(assignedCourse);
            if (!course) {
                return res.status(400).json({ error: 'Assigned course not found' });
            }
        } else {
            processedAssignedCourse = undefined;
        }   
        
        // Process assignedMasterClass - convert empty string to undefined
        let processedAssignedMasterClass = assignedMasterClass;
        if (isValid(assignedMasterClass)) {
            console.log('assignedMasterClass:', assignedMasterClass);
            const masterClass = await MasterClass.findById(assignedMasterClass);
            if (!masterClass) {
                return res.status(400).json({ error: 'Assigned master class not found' });
            }
        } else {
            processedAssignedMasterClass = undefined;
        } 
                    
        const instructor = new Instructor({
            fullName,
            email,
            phone,
            assignedCourse: processedAssignedCourse,
            assignedMasterClass: processedAssignedMasterClass,
            profilePicture,
            yearsOfExperience,
            expertise
        });
        await instructor.save();
        res.status(201).json({ instructor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add instructor' });
    }
};

exports.getInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find().populate('assignedCourse', 'title')
        .populate('assignedCourse', 'title')
        .populate('assignedMasterClass', 'title');
        res.status(200).json({ instructors });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get instructors' });
    }
};

exports.getInstructorById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id)
        .populate('assignedCourse', 'title')
        .populate('assignedMasterClass', 'title');
        if (!instructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }
        res.status(200).json({ instructor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get instructor' });
    }
};

exports.updateInstructor = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            //updateData.profilePicture = req.file.path;
            updateData.profilePicture = getFullUrl.getInstructorImageUrl(req);
        }

         // Optionally validate assignedCourse exists
        if(updateData.assignedCourse){
            const course = await Course.findById(updateData.assignedCourse);
            if (!course) {
                return res.status(400).json({ error: 'Assigned course not found' });
            }
        }

        const instructor = await Instructor.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!instructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }
        res.status(200).json({ instructor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update instructor' });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!instructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }
        res.status(200).json({ message: 'Instructor deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to delete instructor' });
    }
};