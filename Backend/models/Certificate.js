const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  certificateId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  certificateUrl: { 
    type: String 
  },
  verificationUrl: { 
    type: String 
  },
  metadata: {
    studentName: { type: String },
    courseName: { type: String },
    instructorName: { type: String },
    completionDate: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
