// Simple test script to verify module functionality
const mongoose = require('mongoose');
require('dotenv').config();
const Module = require('../models/Module');
const Course = require('../models/Course');
const Content = require('../models/Content');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionString = `${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}`;
    await mongoose.connect(connectionString);
    console.log('MongoDB Connected for testing...');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

// Test creating a module
const testCreateModule = async (courseId) => {
  try {
    console.log(`Creating test module for course ${courseId}...`);
    
    const module = new Module({
      title: 'Test Module',
      description: 'This is a test module',
      course: courseId,
      content: [],
      order: 0
    });
    
    await module.save();
    console.log('Module created successfully:', module);
    
    // Update course to include the module
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('Course not found');
      return null;
    }
    
    if (!course.modules) {
      course.modules = [];
    }
    
    course.modules.push(module._id);
    course.hasModules = true;
    await course.save();
    console.log('Course updated with new module');
    
    return module;
  } catch (error) {
    console.error('Error creating module:', error);
    return null;
  }
};

// Test creating content and adding it to a module
const testCreateContent = async (moduleId, userId) => {
  try {
    console.log(`Creating test content for module ${moduleId}...`);
    
    const content = new Content({
      title: 'Test Content',
      description: 'This is test content for a module',
      fileUrl: 'https://example.com/test.jpg',
      creator: userId,
      status: 'approved',
      type: 'image',
      mediaType: 'image',
      mimeType: 'image/jpeg',
      size: 1024,
      module: moduleId
    });
    
    await content.save();
    console.log('Content created successfully:', content);
    
    // Add content to module
    const module = await Module.findById(moduleId);
    if (!module) {
      console.error('Module not found');
      return null;
    }
    
    module.content.push(content._id);
    await module.save();
    console.log('Module updated with new content');
    
    return content;
  } catch (error) {
    console.error('Error creating content:', error);
    return null;
  }
};

// Test retrieving a module with its content
const testGetModule = async (moduleId) => {
  try {
    console.log(`Retrieving module ${moduleId} with content...`);
    
    const module = await Module.findById(moduleId).populate('content');
    if (!module) {
      console.error('Module not found');
      return null;
    }
    
    console.log('Module retrieved successfully:');
    console.log('Title:', module.title);
    console.log('Description:', module.description);
    console.log('Content count:', module.content.length);
    
    // Display content details
    if (module.content.length > 0) {
      console.log('Content items:');
      module.content.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.mediaType})`);
      });
    }
    
    return module;
  } catch (error) {
    console.error('Error retrieving module:', error);
    return null;
  }
};

// Run the tests
const runTests = async () => {
  try {
    await connectDB();
    
    // Get a course ID and user ID for testing
    // You'll need to replace these with actual IDs from your database
    const courseId = ''; // Replace with an actual course ID
    const userId = '';   // Replace with an actual user ID
    
    if (!courseId || !userId) {
      console.error('Please provide valid course and user IDs for testing');
      process.exit(1);
    }
    
    // Run the tests
    const module = await testCreateModule(courseId);
    if (module) {
      const content = await testCreateContent(module._id, userId);
      if (content) {
        await testGetModule(module._id);
      }
    }
    
    console.log('Tests completed');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

// Uncomment to run the tests
// runTests();

module.exports = {
  testCreateModule,
  testCreateContent,
  testGetModule,
  runTests
};
