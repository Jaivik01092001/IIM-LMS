const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
  quiz: [{ question: String, options: [String], answer: String }],
  enrolledUsers: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  }],
  certificateUrl: { type: String }, // Cloudinary URL for certificate
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);