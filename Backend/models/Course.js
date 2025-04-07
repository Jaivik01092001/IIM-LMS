const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
  quiz: [{ question: String, options: [String], answer: String }],
  enrolledUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }, // 0-100%
    lastAccessedAt: { type: Date },
  }],
  certificateUrl: { type: String }, // Cloudinary URL for certificate
  description: { type: String },
  duration: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags: [{ type: String }],
  thumbnail: { type: String }, // URL to course thumbnail image
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);