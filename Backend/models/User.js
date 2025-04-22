const mongoose = require('mongoose');
const { formatPhoneNumber, isValidIndianPhoneNumber } = require('../utils/phoneUtils');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ['educator', 'university', 'admin'], required: true },
  // Reference to the Role model for fine-grained permissions
  roleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  name: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' }, // For educators
  refreshToken: { type: String }, // Added for JWT refresh token
  otp: { type: String },
  otpExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  profile: { // Added for settings
    address: { type: String },
    zipcode: { type: String },
    state: { type: String },
    bio: { type: String },
    avatar: { type: String }, // URL to profile image
    socialLinks: {
      website: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String }
    },
  },
  status: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
}, { timestamps: true });

// Pre-save hook to format phone number
userSchema.pre('save', function(next) {
  // Only format the phone number if it's modified or new
  if (this.isModified('phoneNumber') || this.isNew) {
    this.phoneNumber = formatPhoneNumber(this.phoneNumber);
  }
  next();
});

// Custom validation for phone number
userSchema.path('phoneNumber').validate(function(value) {
  return isValidIndianPhoneNumber(value);
}, 'Please enter a valid 10-digit Indian phone number');

module.exports = mongoose.model('User', userSchema);