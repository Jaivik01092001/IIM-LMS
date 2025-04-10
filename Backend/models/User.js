const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['educator', 'university', 'admin'], required: true },
  name: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' }, // For educators
  refreshToken: { type: String }, // Added for JWT refresh token
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  profile: { // Added for settings
    phone: { type: String },
    address: { type: String },
    bio: { type: String },
    avatar: { type: String }, // URL to profile image
    socialLinks: {
      website: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String }
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);