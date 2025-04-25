const mongoose = require('mongoose');

const userModuleProgressSchema = new mongoose.Schema({
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
  moduleProgress: [{
    module: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Module' 
    },
    isCompleted: { 
      type: Boolean, 
      default: false 
    },
    completedContent: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Content' 
    }],
    lastAccessedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastAccessedModule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }
}, { timestamps: true });

// Compound index to ensure a user can only have one progress record per course
userModuleProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('UserModuleProgress', userModuleProgressSchema);
