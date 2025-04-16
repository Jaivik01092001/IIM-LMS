const Module = require('../models/Module');
const Course = require('../models/Course');
const Content = require('../models/Content');
const mongoose = require('mongoose');

// Create a new module for a course
exports.createModule = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;

    // Validate required fields
    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and courseId are required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create new module
    const module = new Module({
      title,
      description,
      course: courseId,
      content: [],
      order: course.modules ? course.modules.length : 0, // Set order to the end of the list
    });

    await module.save();

    // Add module to course
    if (!course.modules) {
      course.modules = [];
    }
    course.modules.push(module._id);
    course.hasModules = true;
    await course.save();

    res.status(201).json(module);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Error creating module', error: error.message });
  }
};

// Get all modules for a course
exports.getModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ course: courseId })
      .populate('content')
      .sort({ order: 1 });

    res.json(modules);
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({ message: 'Error getting modules', error: error.message });
  }
};

// Get a specific module
exports.getModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId)
      .populate('content')
      .populate('course', 'title');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ message: 'Error getting module', error: error.message });
  }
};

// Update a module
exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, order } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Update fields
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await module.save();
    res.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Error updating module', error: error.message });
  }
};

// Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Remove module from course
    await Course.findByIdAndUpdate(
      module.course,
      { $pull: { modules: moduleId } }
    );

    // Update content items to remove module reference
    await Content.updateMany(
      { module: moduleId },
      { $unset: { module: "" } }
    );

    // Delete the module
    await Module.findByIdAndDelete(moduleId);

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Error deleting module', error: error.message });
  }
};

// Add content to a module
exports.addContentToModule = async (req, res) => {
  try {
    const { moduleId, contentId } = req.body;

    // Validate required fields
    if (!moduleId || !contentId) {
      return res.status(400).json({ message: 'moduleId and contentId are required' });
    }

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Add content to module if not already added
    if (!module.content.includes(contentId)) {
      module.content.push(contentId);
      await module.save();
    }

    // Update content to reference this module
    content.module = moduleId;
    await content.save();

    res.json(module);
  } catch (error) {
    console.error('Error adding content to module:', error);
    res.status(500).json({ message: 'Error adding content to module', error: error.message });
  }
};

// Remove content from a module
exports.removeContentFromModule = async (req, res) => {
  try {
    const { moduleId, contentId } = req.params;

    // Check if module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Remove content from module
    module.content = module.content.filter(id => id.toString() !== contentId);
    await module.save();

    // Update content to remove module reference
    await Content.findByIdAndUpdate(
      contentId,
      { $unset: { module: "" } }
    );

    res.json(module);
  } catch (error) {
    console.error('Error removing content from module:', error);
    res.status(500).json({ message: 'Error removing content from module', error: error.message });
  }
};

// Reorder modules in a course
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleOrder } = req.body;

    if (!moduleOrder || !Array.isArray(moduleOrder)) {
      return res.status(400).json({ message: 'moduleOrder array is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update order for each module
    const updatePromises = moduleOrder.map((item, index) => {
      return Module.findByIdAndUpdate(
        item.moduleId,
        { order: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Get updated modules
    const updatedModules = await Module.find({ course: courseId }).sort({ order: 1 });

    res.json(updatedModules);
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ message: 'Error reordering modules', error: error.message });
  }
};
