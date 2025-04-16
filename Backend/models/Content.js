const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // Cloudinary URL
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['document', 'video', 'image', 'presentation', 'quiz'], default: 'document' },
  mediaType: { type: String, enum: ['image', 'video', 'document', 'other'], default: 'document' },
  mimeType: { type: String }, // Store the MIME type for better media handling
  duration: { type: Number }, // For videos (in seconds)
  size: { type: Number }, // File size in bytes
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }, // Reference to the module it belongs to
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Helper method to determine if content is playable media
contentSchema.methods.isPlayableMedia = function () {
  return this.mediaType === 'video' || this.mediaType === 'image';
};

module.exports = mongoose.model('Content', contentSchema);