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
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  certificateNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  certificateUrl: { 
    type: String, 
    required: true 
  },
  verificationCode: { 
    type: String, 
    required: true 
  },
}, { timestamps: true });

// Generate a unique certificate number
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.certificateNumber = `IIM-${year}${month}-${random}`;
  }
  
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
