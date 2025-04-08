const CmsPage = require('../models/CmsPage');
const AppError = require('../utils/appError');

// Get all published pages
exports.getPublishedPages = async (req, res) => {
  try {
    const pages = await CmsPage.find({ status: 'published' })
      .sort({ order: 1 })
      .select('title slug metaTitle metaDescription showInNavigation order');
    
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a single page by slug
exports.getPageBySlug = async (req, res) => {
  try {
    const page = await CmsPage.findOne({ 
      slug: req.params.slug,
      status: 'published' 
    }).populate('creator', 'name');
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin routes

// Get all pages (admin)
exports.getAllPages = async (req, res) => {
  try {
    const pages = await CmsPage.find()
      .sort({ createdAt: -1 })
      .populate('creator', 'name');
    
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a single page by ID (admin)
exports.getPageById = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id)
      .populate('creator', 'name');
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create a new page
exports.createPage = async (req, res) => {
  try {
    const { title, content, status, metaTitle, metaDescription, metaKeywords, showInNavigation, order } = req.body;
    
    const newPage = new CmsPage({
      title,
      content,
      status: status || 'draft',
      creator: req.user.id,
      metaTitle,
      metaDescription,
      metaKeywords,
      showInNavigation: showInNavigation || false,
      order: order || 0
    });
    
    const page = await newPage.save();
    res.json(page);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'A page with this title already exists' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a page
exports.updatePage = async (req, res) => {
  try {
    const { title, content, status, metaTitle, metaDescription, metaKeywords, showInNavigation, order, slug } = req.body;
    
    const pageFields = {};
    if (title) pageFields.title = title;
    if (content) pageFields.content = content;
    if (status) pageFields.status = status;
    if (metaTitle) pageFields.metaTitle = metaTitle;
    if (metaDescription) pageFields.metaDescription = metaDescription;
    if (metaKeywords) pageFields.metaKeywords = metaKeywords;
    if (showInNavigation !== undefined) pageFields.showInNavigation = showInNavigation;
    if (order !== undefined) pageFields.order = order;
    if (slug) pageFields.slug = slug;
    
    let page = await CmsPage.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    // Check if user is admin or the creator of the page
    if (req.user.role !== 'admin' && page.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    page = await CmsPage.findByIdAndUpdate(
      req.params.id,
      { $set: pageFields },
      { new: true }
    );
    
    res.json(page);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'A page with this title or slug already exists' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a page
exports.deletePage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    // Check if user is admin or the creator of the page
    if (req.user.role !== 'admin' && page.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await page.remove();
    
    res.json({ msg: 'Page removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Publish a page
exports.publishPage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    // Check if user is admin or the creator of the page
    if (req.user.role !== 'admin' && page.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    page.status = 'published';
    await page.save();
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Unpublish a page
exports.unpublishPage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    // Check if user is admin or the creator of the page
    if (req.user.role !== 'admin' && page.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    page.status = 'draft';
    await page.save();
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
