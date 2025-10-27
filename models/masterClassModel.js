const mongoose = require('mongoose');

const masterClassSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
    //enum: ['Software Development', 'Data Science (AI/ML)', 'DevOps', 'ReactJS'], // updated to match JSON
  },
  image: {
    type: String, // store URL or file path
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  price:{
      type: Number,
      required: true
  },  
  discount:{
      type: Number,
      required: false,
      default: 0
  },  
  discountAmount:{
      type: Number,
      required: false
  },
  finalPrice:{
      type: Number,
      required: false
  },    
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  aboutMasterClass: {
    type: String
  },
  whatYouWillLearn: {
    type: String
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instructors'
  },
  noOfRegisteredUsers: {
    type: Number,
    default: 0
  },
  description: [
    {
      title: { type: String, required: true },
      des: { type: String },
      html: { type: String }
    }
  ],
  bookingForm: { 
    type: Boolean,
    default: true
  },  // indicates whether booking is open
  isSoftDelete: {
    type: Boolean,
    default: false
  },  
  isFree: {
    type: Boolean,
    default: false
  },
  topics: {
      type: [String],
      default: [],
      required: false
  },
  syllabus: {
      type: String,   // Store PDF file path or URL
      required: false 
  }
}, { timestamps: true });

const MasterClass = mongoose.model('masterclasses', masterClassSchema);
module.exports = MasterClass;
