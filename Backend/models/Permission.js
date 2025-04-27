const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'course_management',
      'quiz_management',
      'user_management',
      'content_management',
      'certificate_management',
      'reports_analytics',
      'system_settings',
      'school_management',
      'educator_management'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
