const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // Cloudinary URL
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String }],
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);