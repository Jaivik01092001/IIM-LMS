const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['published', 'draft'], 
    default: 'draft' 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  metaTitle: { 
    type: String 
  },
  metaDescription: { 
    type: String 
  },
  metaKeywords: { 
    type: String 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  showInNavigation: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

// Generate a slug from the title
cmsPageSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

module.exports = mongoose.model('CmsPage', cmsPageSchema);
