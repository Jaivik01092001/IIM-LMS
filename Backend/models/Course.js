const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }], // Legacy field, kept for backward compatibility
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }], // New field for module-based organization
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  enrolledUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }, // 0-100%
    lastAccessedAt: { type: Date },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }, // Reference to the certificate
  }],
  description: { type: String },
  duration: { type: String },
  category: { type: String },
  language: { type: String, default: 'en' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  tags: [{ type: String }],
  thumbnail: { type: String }, // URL to course thumbnail image
  hasModules: { type: Boolean, default: false }, // Flag to indicate if course uses the new module structure
  status: { type: Number, default: 1 } // 1: active, 0: inactive (soft delete)
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);