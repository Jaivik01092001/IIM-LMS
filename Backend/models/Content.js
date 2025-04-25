const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // Cloudinary URL
  textContent: { type: String }, // For text content type
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['document', 'video', 'image', 'presentation', 'quiz', 'text'], default: 'document' },
  mediaType: { type: String, enum: ['image', 'video', 'document', 'text', 'other'], default: 'document' },
  mimeType: { type: String }, // Store the MIME type for better media handling
  duration: { type: Number }, // For videos (in seconds)
  size: { type: Number }, // File size in bytes
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }, // Reference to the module it belongs to
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
  activeStatus: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
}, { timestamps: true });

// Helper method to determine if content is playable media
contentSchema.methods.isPlayableMedia = function () {
  return this.mediaType === 'video' || this.mediaType === 'image';
};

// Pre-save middleware to ensure proper content type handling
contentSchema.pre('save', function (next) {
  // If content type is 'text', ensure mediaType is also 'text'
  if (this.type === 'text') {
    this.mediaType = 'text';
    this.mimeType = 'text/html';
  }

  // Ensure fileUrl is only required for non-text content
  if (this.type !== 'text' && !this.fileUrl) {
    this.invalidate('fileUrl', 'File URL is required for non-text content');
  }

  next();
});

module.exports = mongoose.model('Content', contentSchema);