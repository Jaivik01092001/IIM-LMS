const Blog = require("../models/Blog");

// Create
exports.createBlog = async (req, res) => {
  try {
    // Get fields from FormData
    const title = req.body.title;
    const shortDescription = req.body.shortDescription;
    const content = req.body.content;
    const tags = req.body.tags;
    const status = req.body.status;
    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(); // simple slug

    // Parse tags if it's a string (from FormData)
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        // Check if it's a JSON string array
        if (tags.startsWith('[') && tags.endsWith(']')) {
          parsedTags = JSON.parse(tags);
        } else {
          // If it's a comma-separated string
          parsedTags = tags.split(',').map(tag => tag.trim());
        }
      } catch (err) {
        console.error('Error parsing tags:', err);
        parsedTags = [tags]; // Fallback to single tag
      }
    }

    // Handle file upload
    let coverImagePath = null;
    if (req.file) {
      // The file has been uploaded to uploads/blogs directory
      // The path should be relative to the public directory
      coverImagePath = `uploads/blogs/${req.file.filename}`;
      console.log('Blog cover image saved at:', coverImagePath);
    }

    const blog = new Blog({
      title,
      slug,
      shortDescription,
      content,
      tags: parsedTags,
      status,
      createdBy: req.user._id,
      coverImage: coverImagePath, // This will be null if no image was uploaded
    });

    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Read all (with filters like status, tags)
exports.getAllBlogs = async (req, res) => {
  try {
    const { status, tag, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false, activeStatus: 1 };

    if (status) query.status = status;
    if (tag) query.tags = tag;

    const blogs = await Blog.find(query)
      .populate({
        path: 'createdBy',
        select: 'name email profile.avatar role'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({ success: true, blogs, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Read single
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      isDeleted: false,
      activeStatus: 1
    }).populate({
      path: 'createdBy',
      select: 'name email profile.avatar role'
    });

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update
exports.updateBlog = async (req, res) => {
  try {
    // Get fields from FormData
    const title = req.body.title;
    const shortDescription = req.body.shortDescription;
    const content = req.body.content;
    const tags = req.body.tags;
    const status = req.body.status;

    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.isDeleted || blog.activeStatus === 0)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    // Update basic fields if provided
    if (title) blog.title = title;
    if (shortDescription) blog.shortDescription = shortDescription;
    if (content) blog.content = content;
    if (status) blog.status = status;

    // Parse tags if it's a string (from FormData)
    if (tags) {
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          // Check if it's a JSON string array
          if (tags.startsWith('[') && tags.endsWith(']')) {
            parsedTags = JSON.parse(tags);
          } else {
            // If it's a comma-separated string
            parsedTags = tags.split(',').map(tag => tag.trim());
          }
        } catch (err) {
          console.error('Error parsing tags:', err);
          parsedTags = [tags]; // Fallback to single tag
        }
      }
      blog.tags = parsedTags;
    }

    // Handle file upload
    if (req.file) {
      // The file has been uploaded to uploads/blogs directory
      // The path should be relative to the public directory
      blog.coverImage = `/uploads/blogs/${req.file.filename}`;
      console.log('Blog cover image updated to:', blog.coverImage);
    }

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete (soft delete)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    blog.isDeleted = true;
    blog.activeStatus = 0;
    await blog.save();

    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Restore a deleted blog
exports.restoreBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    blog.isDeleted = false;
    blog.activeStatus = 1;
    await blog.save();

    res.json({ success: true, message: "Blog restored", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all deleted blogs (admin function)
exports.getDeletedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { isDeleted: true },
        { activeStatus: 0 }
      ]
    };

    const blogs = await Blog.find(query)
      .populate({
        path: 'createdBy',
        select: 'name email profile.avatar role'
      })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({ success: true, blogs, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
