const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
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
  // Store permissions directly in the role document for simplicity and performance
  permissions: {
    type: Map,
    of: Boolean,
    default: {}
  },
  // Track when the role was created and last updated
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
