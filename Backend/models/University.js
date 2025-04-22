const mongoose = require('mongoose');
const { formatPhoneNumber, isValidIndianPhoneNumber } = require('../utils/phoneUtils');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  zipcode: { type: String },
  state: { type: String },
  contactPerson: { type: String },
  educators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
}, { timestamps: true });

// Pre-save hook to format phone number
universitySchema.pre('save', function(next) {
  // Only format the phone number if it's modified or new
  if (this.isModified('phone') || this.isNew) {
    this.phone = formatPhoneNumber(this.phone);
  }
  next();
});

// Custom validation for phone number
universitySchema.path('phone').validate(function(value) {
  // Allow empty phone numbers (not required)
  if (!value) return true;
  return isValidIndianPhoneNumber(value);
}, 'Please enter a valid 10-digit Indian phone number');

module.exports = mongoose.model('University', universitySchema);