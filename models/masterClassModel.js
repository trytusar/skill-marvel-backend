const mongoose = require('mongoose');

const masterClassSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Software Development', 'Data Science AI/ML', 'DevOps'], // you can extend this
    },
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    noOfRegisteredUsers: {
        type: Number,
        default: 0
    },
    description: [
        {
            title: {
                type: String,
                required: true
            },
            des: {
                type: String,
                required: false
            },
            html: {
                type: String,
                required: false
            }
        }
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'instructors',
        required: true
    },
    bookingForm: {
        type: Boolean,
        default: true // indicates whether booking is open
    },
    isSoftDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const MasterClass = mongoose.model('masterclasses', masterClassSchema);
module.exports = MasterClass;
