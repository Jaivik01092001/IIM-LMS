const Content = require('../models/Content');
const Course = require('../models/Course');
const University = require('../models/University');
const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const bcrypt = require('bcryptjs');
const { formatPhoneNumber } = require('../utils/phoneUtils');

exports.getUniversities = async (req, res) => {
  try {
    // Return all universities regardless of status
    const universities = await University.find().populate('educators');
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving universities', error: error.message });
  }
};

exports.createUniversity = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      roleId,
      phoneNumber,
      address,
      zipcode,
      state,
      contactPerson
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const universityUser = new User({
      email,
      password: hashedPassword,
      role: 'university',
      name,
      phoneNumber: phoneNumber || '+919876543210', // Default phone number if not provided
      roleRef: roleId || undefined, // Assign role if provided
      profile: {
        address,
        zipcode,
        state
      }
    });

    await universityUser.save();

    const university = new University({
      name,
      email,
      phone: phoneNumber,
      address,
      zipcode,
      state,
      contactPerson,
      educators: []
    });

    universityUser.university = university._id;
    await university.save();
    await universityUser.save();

    res.json(university);
  } catch (error) {
    next(error);
  }
};

exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id)
      .populate('educators', 'name email phoneNumber');

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving university', error: error.message });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Soft delete - update status to 0 (inactive)
    university.status = 0;
    await university.save();

    // Also update the associated university user to inactive
    const universityUser = await User.findOne({ university: university._id, role: 'university' });
    if (universityUser) {
      universityUser.status = 0;
      await universityUser.save();
    }

    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting university', error: error.message });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    const { name, email, phone, address, zipcode, state, contactPerson, status } = req.body;
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    university.name = name || university.name;
    university.email = email || university.email;
    university.phone = phone || university.phone;
    university.address = address || university.address;
    university.zipcode = zipcode || university.zipcode;
    university.state = state || university.state;
    university.contactPerson = contactPerson || university.contactPerson;

    // Handle status update if provided
    if (status !== undefined) {
      university.status = Number(status);
    }

    await university.save();
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Error updating university', error: error.message });
  }
};

exports.getContent = async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = { activeStatus: 1 }; // Only return active content

    if (search) query.title = { $regex: search, $options: 'i' };
    if (filter) query.status = filter;

    const content = await Content.find(query).populate('creator', 'name');
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving content', error: error.message });
  }
};

// exports.createContent = async (req, res) => {
//   const { title, description } = req.body;
//   const fileUrl = req.file ? req.file.path : null;
//   const content = new Content({
//     title,
//     description,
//     fileUrl,
//     creator: req.user.id,
//     status: "approved", // Admin-created content is auto-approved
//   });
//   await content.save();
//   res.json(content);
// };

// controllers/adminController.js
//const Content = require('../models/Content');

exports.createContent = async (req, res) => {
  try {
    const { title, description, moduleId, type } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    if (!fileUrl) {
      return res.status(400).json({ msg: 'File upload failed' });
    }

    // Determine media type based on file extension
    let mediaType = 'document';
    let mimeType = req.file.mimetype;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    if (['mp4', 'mov', 'avi', 'mkv'].includes(fileExt)) {
      mediaType = 'video';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      mediaType = 'image';
    }

    const content = new Content({
      title,
      description,
      fileUrl,
      creator: req.user.id,
      status: 'approved',
      type: type || (mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : 'document'),
      mediaType,
      mimeType,
      size: req.file.size,
      module: moduleId || null
    });

    await content.save();

    // If moduleId is provided, add content to the module
    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (module) {
        if (!module.content.includes(content._id)) {
          module.content.push(content._id);
          await module.save();
        }
      }
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ msg: error.message || 'Server Error' });
  }
};


exports.updateContent = async (req, res) => {
  const { title, description } = req.body;
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ msg: 'Content not found' });
  content.title = title || content.title;
  content.description = description || content.description;
  await content.save();
  res.json(content);
};
exports.approveContent = async (req, res) => {
  const content = await Content.findById(req.params.id);
  content.status = 'approved';
  await content.save();
  res.json(content);
};

exports.rejectContent = async (req, res) => {
  const content = await Content.findById(req.params.id);
  content.status = 'rejected';
  await content.save();
  res.json(content);
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Soft delete - update activeStatus to 0 (inactive)
    content.activeStatus = 0;
    await content.save();

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
};

// Get all courses (both active and inactive)
exports.getCourses = async (req, res) => {
  try {
    // Return all courses regardless of status
    const courses = await Course.find().populate('creator', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

// Get a specific course with its content, modules, and quizzes
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name')
      .populate('content')
      .populate({
        path: 'modules',
        populate: [
          {
            path: 'content',
            model: 'Content'
          },
          {
            path: 'quiz',
            model: 'Quiz'
          }
        ]
      })
      .populate({
        path: 'quizzes',
        // Include all quiz fields including questions
        select: 'title description questions timeLimit passingScore attempts'
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ message: 'Error retrieving course', error: error.message });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    console.log("Create course route hit");
    console.log("Request headers:", req.headers);
    console.log("Request body size:", JSON.stringify(req.body).length);
    console.log("Number of files:", req.files ? req.files.length : 0);
    
    if (req.file) {
      console.log("Thumbnail file:", {
        size: req.file.size,
        type: req.file.mimetype,
        name: req.file.originalname
      });
    }

    // Start timing the request
    const startTime = Date.now();

    // Destructure fields from request body
    const {
      title,
      description,
      duration,
      category,
      subcategory,
      language,
      targetAudience,
      level,
      tags,
      thumbnailUrl,
      hasModules,
      modules,
      content,
      quizzes,
      learningOutcomes,
      requirements,
      status,
      isDraft
    } = req.body;

    console.log("Time after destructuring:", Date.now() - startTime, "ms");
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        message: 'Error creating course',
        error: 'Course validation failed: title: Path `title` is required.'
      });
    }

    // Prepare thumbnail URL
    let thumbnail = thumbnailUrl;
    if (req.file) {
      thumbnail = req.file.path;
    }

    // Parse JSON strings for arrays if they are strings
    let parsedModules = modules;
    try {
      if (modules && typeof modules === 'string') {
        parsedModules = JSON.parse(modules);
        console.log("Time after parsing modules:", Date.now() - startTime, "ms");
      }
    } catch (err) {
      console.error("Error parsing modules JSON:", err);
      parsedModules = [];
    }

    let parsedContent = content;
    try {
      if (content && typeof content === 'string') {
        parsedContent = JSON.parse(content);
      }
    } catch (err) {
      console.error("Error parsing content JSON:", err);
      parsedContent = [];
    }

    let parsedQuizzes = quizzes;
    try {
      if (quizzes && typeof quizzes === 'string') {
        parsedQuizzes = JSON.parse(quizzes);
      }
    } catch (err) {
      console.error("Error parsing quizzes JSON:", err);
      parsedQuizzes = [];
    }

    let parsedTags = tags;
    try {
      if (tags && typeof tags === 'string') {
        parsedTags = JSON.parse(tags);
      }
    } catch (err) {
      console.error("Error parsing tags JSON:", err);
      parsedTags = [];
    }

    let parsedLearningOutcomes = learningOutcomes;
    try {
      if (learningOutcomes && typeof learningOutcomes === 'string') {
        parsedLearningOutcomes = JSON.parse(learningOutcomes);
      }
    } catch (err) {
      console.error("Error parsing learningOutcomes JSON:", err);
      parsedLearningOutcomes = [];
    }

    let parsedRequirements = requirements;
    try {
      if (requirements && typeof requirements === 'string') {
        parsedRequirements = JSON.parse(requirements);
      }
    } catch (err) {
      console.error("Error parsing requirements JSON:", err);
      parsedRequirements = [];
    }

    // Process content files if they exist
    const contentFileIds = req.body.contentFileIds ?
      Array.isArray(req.body.contentFileIds) ? req.body.contentFileIds : [req.body.contentFileIds] : [];

    // Create content items for uploaded files
    const contentItems = [];

    // Check if we have content files in the request
    if (req.files && req.files.length > 0) {
      console.log("Starting content file processing at:", Date.now() - startTime, "ms");
      console.log("Number of files to process:", req.files.length);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Skip the thumbnail file
        if (file.fieldname === 'thumbnail') continue;

        // Extract the index from the fieldname (contentFiles[0], contentFiles[1], etc.)
        const fieldnameParts = file.fieldname.match(/\[(\d+)\]/);
        if (!fieldnameParts) continue;

        const index = parseInt(fieldnameParts[1]);
        const contentId = contentFileIds[index];

        if (!contentId) continue;

        // Find the corresponding content item in parsedContent
        const contentItem = parsedContent.find(item => item._id === contentId);
        if (!contentItem) continue;

        console.log(`Processing file ${i + 1}/${req.files.length} at:`, Date.now() - startTime, "ms");

        // Create a new content item
        const content = new Content({
          title: contentItem.title,
          description: contentItem.description,
          fileUrl: file.path,
          creator: req.user.id,
          status: 'approved',
          type: contentItem.type || (mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : 'document'),
          mediaType,
          mimeType,
          size: file.size,
          module: null
        });

        try {
          await content.save();
          console.log(`Saved content ${i + 1}/${req.files.length} at:`, Date.now() - startTime, "ms");
          contentItems.push({
            id: contentId,
            dbId: content._id
          });
        } catch (err) {
          console.error(`Error saving content ${i + 1}:`, err);
          throw err;
        }
      }
    }

    console.log("Starting course creation at:", Date.now() - startTime, "ms");

    // Create course with all provided fields
    const course = new Course({
      title,
      description,
      duration,
      category,
      subcategory,
      language: language || 'en',
      targetAudience,
      level: level || 'beginner',
      tags: parsedTags || [],
      thumbnail,
      hasModules: hasModules === 'true' || hasModules === true,
      modules: [], // Initialize with empty array, we'll add modules after saving
      content: contentItems.map(item => item.dbId),
      quizzes: parsedQuizzes || [],
      learningOutcomes: parsedLearningOutcomes || [],
      requirements: parsedRequirements || [],
      creator: req.user.id,
      status: status || 'draft',
      isDraft: isDraft === 'true' || isDraft === true
    });

    try {
      await course.save();
      console.log("Course saved at:", Date.now() - startTime, "ms");
      res.json(course);
    } catch (err) {
      console.error("Error saving course:", err);
      throw err;
    }

  } catch (error) {
    console.error("Final error in createCourse:", error);
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      category,
      subcategory,
      language,
      targetAudience,
      level,
      tags,
      thumbnailUrl,
      hasModules,
      modules,
      content,
      quizzes,
      learningOutcomes,
      requirements,
      status,
      isDraft
    } = req.body;

    console.log("Update course data:", req.body);
    console.log("Request file:", req.file);

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update fields if provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (category) course.category = category;
    if (subcategory) course.subcategory = subcategory;
    if (language) course.language = language;
    if (targetAudience) course.targetAudience = targetAudience;
    if (level) course.level = level;

    // Handle thumbnail update
    if (req.file) {
      course.thumbnail = req.file.path;
    } else if (thumbnailUrl) {
      course.thumbnail = thumbnailUrl;
    }

    // Parse and update array fields with proper error handling
    // Parse JSON strings for arrays if they are strings
    if (tags) {
      try {
        course.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (err) {
        console.error("Error parsing tags JSON:", err);
      }
    }

    if (learningOutcomes) {
      try {
        course.learningOutcomes = typeof learningOutcomes === 'string' ? JSON.parse(learningOutcomes) : learningOutcomes;
      } catch (err) {
        console.error("Error parsing learningOutcomes JSON:", err);
      }
    }

    if (requirements) {
      try {
        course.requirements = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
      } catch (err) {
        console.error("Error parsing requirements JSON:", err);
      }
    }

    if (hasModules !== undefined) {
      course.hasModules = hasModules === 'true' || hasModules === true;
    }

    if (modules) {
      try {
        const parsedModules = typeof modules === 'string' ? JSON.parse(modules) : modules;
        console.log("Parsed modules in update:", parsedModules);

        // Handle module updates
        if (Array.isArray(parsedModules)) {
          // Get existing module IDs
          const existingModuleIds = course.modules.map(id => id.toString());

          // Process each module in the update
          for (const moduleData of parsedModules) {
            if (moduleData._id && existingModuleIds.includes(moduleData._id.toString())) {
              // Update existing module
              const existingModule = await Module.findById(moduleData._id);
              if (existingModule) {
                existingModule.title = moduleData.title || existingModule.title;
                existingModule.description = moduleData.description || existingModule.description;
                existingModule.order = moduleData.order !== undefined ? moduleData.order : existingModule.order;

                // Update content associations if provided
                if (moduleData.content && Array.isArray(moduleData.content)) {
                  // Replace temporary content IDs with database IDs
                  const updatedContent = [];

                  for (const contentId of moduleData.content) {
                    // Check if this is a newly created content item
                    const newContentItem = contentItems.find(item => item.id === contentId);

                    if (newContentItem) {
                      // Use the database ID for newly created content
                      updatedContent.push(newContentItem.dbId);
                    } else if (!contentId.startsWith('temp_')) {
                      // Only include non-temporary IDs that are valid ObjectIds
                      try {
                        // Verify this is a valid content ID
                        const contentExists = await Content.findById(contentId);
                        if (contentExists) {
                          updatedContent.push(contentId);
                        }
                      } catch (err) {
                        console.error(`Error finding content with ID ${contentId}:`, err.message);
                        // Skip this content ID if it's invalid
                      }
                    }
                  }

                  // Update module content
                  existingModule.content = updatedContent;

                  // Update content items to reference this module
                  for (const contentId of updatedContent) {
                    try {
                      const contentExists = await Content.findById(contentId);
                      if (contentExists) {
                        contentExists.module = existingModule._id;
                        await contentExists.save();
                      }
                    } catch (err) {
                      console.error(`Error updating content reference for ID ${contentId}:`, err.message);
                    }
                  }
                }

                // Update quiz if provided
                if (moduleData.quiz) {
                  const quizData = moduleData.quiz;

                  // Check if quiz has an ID (existing quiz)
                  if (quizData._id) {
                    // Update existing quiz
                    const existingQuiz = await Quiz.findById(quizData._id);
                    if (existingQuiz) {
                      existingQuiz.title = quizData.title || existingQuiz.title;
                      existingQuiz.description = quizData.description || existingQuiz.description;
                      existingQuiz.questions = quizData.questions || existingQuiz.questions;
                      existingQuiz.timeLimit = quizData.timeLimit || existingQuiz.timeLimit;
                      existingQuiz.passingScore = quizData.passingScore || existingQuiz.passingScore;

                      await existingQuiz.save();
                    }
                  } else {
                    // Create new quiz
                    const quiz = new Quiz({
                      title: quizData.title || `${existingModule.title} Quiz`,
                      description: quizData.description || `Quiz for ${existingModule.title}`,
                      course: course._id,
                      questions: quizData.questions || [],
                      timeLimit: quizData.timeLimit || 30,
                      passingScore: quizData.passingScore || 60
                    });

                    await quiz.save();

                    // Associate quiz with module
                    existingModule.quiz = quiz._id;

                    // Add quiz to course's quizzes array
                    if (!course.quizzes.includes(quiz._id)) {
                      course.quizzes.push(quiz._id);
                    }
                  }
                }

                await existingModule.save();
              }
            } else {
              // Create new module
              const newModule = new Module({
                title: moduleData.title || 'Untitled Module',
                description: moduleData.description || '',
                course: course._id,
                order: moduleData.order || 0,
                content: [] // Initialize with empty content array
              });

              await newModule.save();

              // Add to course modules
              course.modules.push(newModule._id);

              // If module has content, associate it
              if (moduleData.content && moduleData.content.length > 0) {
                // Replace temporary content IDs with database IDs
                const updatedContent = [];

                for (const contentId of moduleData.content) {
                  // Check if this is a newly created content item
                  const newContentItem = contentItems.find(item => item.id === contentId);

                  if (newContentItem) {
                    // Use the database ID for newly created content
                    updatedContent.push(newContentItem.dbId);
                  } else if (!contentId.startsWith('temp_')) {
                    // Only include non-temporary IDs that are valid ObjectIds
                    try {
                      // Verify this is a valid content ID
                      const contentExists = await Content.findById(contentId);
                      if (contentExists) {
                        updatedContent.push(contentId);
                      }
                    } catch (err) {
                      console.error(`Error finding content with ID ${contentId}:`, err.message);
                      // Skip this content ID if it's invalid
                    }
                  }
                }

                // Update module content
                newModule.content = updatedContent;

                // Update content items to reference this module
                for (const contentId of updatedContent) {
                  try {
                    const contentExists = await Content.findById(contentId);
                    if (contentExists) {
                      contentExists.module = newModule._id;
                      await contentExists.save();
                    }
                  } catch (err) {
                    console.error(`Error updating content reference for ID ${contentId}:`, err.message);
                  }
                }

                await newModule.save();
              }

              // If module has a quiz, create it and associate it with the module
              if (moduleData.quiz) {
                const quizData = moduleData.quiz;

                // Create a new quiz
                const quiz = new Quiz({
                  title: quizData.title || `${newModule.title} Quiz`,
                  description: quizData.description || `Quiz for ${newModule.title}`,
                  course: course._id,
                  questions: quizData.questions || [],
                  timeLimit: quizData.timeLimit || 30,
                  passingScore: quizData.passingScore || 60
                });

                await quiz.save();

                // Associate quiz with module
                newModule.quiz = quiz._id;
                await newModule.save();

                // Add quiz to course's quizzes array
                if (!course.quizzes.includes(quiz._id)) {
                  course.quizzes.push(quiz._id);
                }
              }
            }
          }

          // Remove modules that are no longer in the update
          const updatedModuleIds = parsedModules
            .filter(m => m._id)
            .map(m => m._id.toString());

          const modulesToRemove = existingModuleIds.filter(id => !updatedModuleIds.includes(id));

          if (modulesToRemove.length > 0) {
            // Remove modules from course
            course.modules = course.modules.filter(id => !modulesToRemove.includes(id.toString()));

            // Delete the modules
            for (const moduleId of modulesToRemove) {
              // Update content items to remove module reference
              await Content.updateMany(
                { module: moduleId },
                { $unset: { module: "" } }
              );

              // Delete the module
              await Module.findByIdAndDelete(moduleId);
            }
          }
        }
      } catch (err) {
        console.error("Error processing modules update:", err);
      }
    }

    // Process content files if they exist
    const contentFileIds = req.body.contentFileIds ?
      Array.isArray(req.body.contentFileIds) ? req.body.contentFileIds : [req.body.contentFileIds] : [];

    // Create content items for uploaded files
    const contentItems = [];

    // Check if we have content files in the request
    if (req.files && req.files.length > 0) {
      console.log("Processing content files for update:", req.files.length);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Skip the thumbnail file
        if (file.fieldname === 'thumbnail') continue;

        // Extract the index from the fieldname (contentFiles[0], contentFiles[1], etc.)
        const fieldnameParts = file.fieldname.match(/\[(\d+)\]/);
        if (!fieldnameParts) continue;

        const index = parseInt(fieldnameParts[1]);
        const contentId = contentFileIds[index];

        if (!contentId) continue;

        // Parse content if it's a string
        let parsedContent;
        try {
          parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        } catch (err) {
          console.error("Error parsing content JSON:", err);
          parsedContent = [];
        }

        // Find the corresponding content item in parsedContent
        const contentItem = parsedContent.find(item => item._id === contentId);
        if (!contentItem) continue;

        // Determine media type based on file extension
        let mediaType = 'document';
        let mimeType = file.mimetype;
        const fileExt = file.originalname.split('.').pop().toLowerCase();

        if (['mp4', 'mov', 'avi', 'mkv'].includes(fileExt)) {
          mediaType = 'video';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          mediaType = 'image';
        }

        // Create a new content item
        const newContent = new Content({
          title: contentItem.title,
          description: contentItem.description,
          fileUrl: file.path,
          creator: req.user.id,
          status: 'approved',
          type: contentItem.type || (mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : 'document'),
          mediaType,
          mimeType,
          size: file.size,
          module: contentItem.module || null
        });

        await newContent.save();
        contentItems.push({
          id: contentId,
          dbId: newContent._id
        });
      }
    }

    // Update course content
    if (content) {
      try {
        let parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

        // Replace temporary IDs with database IDs for newly created content
        if (contentItems.length > 0) {
          // Filter out content items that have been replaced with new uploads
          parsedContent = parsedContent.filter(item => !contentItems.some(newItem => newItem.id === item._id));

          // Add the newly created content items
          course.content = [...parsedContent, ...contentItems.map(item => item.dbId)];
        } else {
          course.content = parsedContent;
        }
      } catch (err) {
        console.error("Error processing content update:", err);
      }
    }

    if (quizzes) {
      try {
        course.quizzes = typeof quizzes === 'string' ? JSON.parse(quizzes) : quizzes;
      } catch (err) {
        console.error("Error parsing quizzes JSON:", err);
      }
    }

    // Handle status and draft status update if provided
    if (status !== undefined) {
      course.status = Number(status);
    }

    if (isDraft !== undefined) {
      course.isDraft = isDraft === 'true' || isDraft === true;
    }

    // Save the updated course
    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

// Delete a course (soft delete)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Soft delete - update status to 0 (inactive)
    course.status = 0;
    await course.save();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Add content to a course
exports.addContentToCourse = async (req, res) => {
  try {
    const { courseId, contentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Add content to course if not already added
    if (!course.content.includes(contentId)) {
      course.content.push(contentId);
      await course.save();
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error adding content to course', error: error.message });
  }
};

// Add quiz to a course
exports.addQuizToCourse = async (req, res) => {
  try {
    const { courseId, quizId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if quiz is already in the course
    if (!course.quizzes.includes(quizId)) {
      course.quizzes.push(quizId);
      await course.save();
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error adding quiz to course', error: error.message });
  }
};

// Create a quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, questions, timeLimit, passingScore } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const Quiz = require('../models/Quiz');
    const quiz = new Quiz({
      title,
      description,
      course: courseId,
      questions: questions || [],
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 60
    });

    await quiz.save();

    // Add quiz to course if not added automatically
    if (!course.quizzes.includes(quiz._id)) {
      course.quizzes.push(quiz._id);
      await course.save();
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, passingScore } = req.body;
    const { quizId } = req.params;

    const Quiz = require('../models/Quiz');
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    if (questions) quiz.questions = questions;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
};

// Get all quizzes
exports.getQuizzes = async (_, res) => {
  try {
    const Quiz = require('../models/Quiz');
    const quizzes = await Quiz.find()
      .populate('course', 'title');

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving quizzes', error: error.message });
  }
};

// Get a specific quiz
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const Quiz = require('../models/Quiz');
    const quiz = await Quiz.findById(quizId)
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving quiz', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findById(req.user.id);
  user.name = name || user.name;
  user.profile = { phone, address };
  await user.save();
  res.json(user);
};
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ msg: 'New passwords do not match' });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: 'Invalid current password' });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ msg: 'Password updated' });
};

// Get all users (admin, university, educator)
exports.getAllUsers = async (_, res) => {
  try {
    // Return all users regardless of status
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// Get all educators regardless of university
exports.getAllEducators = async (req, res) => {
  try {
    // Return all educators regardless of university or status
    // Populate the university field to get university name
    const educators = await User.find({ role: 'educator' })
      .select('-password')
      .populate('university', 'name category');
    res.json(educators);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving educators', error: error.message });
  }
};

// Get a specific educator by ID regardless of university
exports.getEducatorById = async (req, res) => {
  try {
    const educator = await User.findOne({
      _id: req.params.id,
      role: 'educator'
    }).select('-password');

    if (!educator) {
      return res.status(404).json({ message: 'Educator not found' });
    }

    res.json(educator);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving educator', error: error.message });
  }
};

// Create a new educator (for admin)
exports.createEducator = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      roleId,
      phoneNumber,
      address,
      zipcode,
      state,
      university,
      category, // Add category field
      schoolName // Add school/university name field
    } = req.body;

    // Generate a random default password if none is provided
    // This is just a placeholder as the system uses OTP for authentication
    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordToHash = password || defaultPassword;

    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Prepare profile object
    const profile = {
      address,
      zipcode,
      state,
      category, // Add category field
      schoolName, // Add school/university name field
      socialLinks: {}
    };

    // Add avatar if profile image was uploaded
    if (req.file) {
      profile.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    const educator = new User({
      email,
      password: hashedPassword,
      role: 'educator',
      name,
      phoneNumber: phoneNumber || '+919876543210', // Default phone number if not provided
      university: university || req.user.id, // Allow admin to specify university or default to admin
      roleRef: roleId || undefined, // Assign role if provided
      profile,
      createdBy: req.user.id // Track who created this educator
    });

    await educator.save();
    res.json({
      educator,
      msg: 'Educator created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update a specific educator by ID regardless of university
exports.updateEducator = async (req, res) => {
  try {
    const { name, email, roleId, phoneNumber, address, zipcode, state, status, category, schoolName } = req.body;
    const educator = await User.findOne({
      _id: req.params.id,
      role: 'educator'
    });

    if (!educator) {
      return res.status(404).json({ msg: 'Educator not found' });
    }

    // Only update fields that are provided
    if (name) educator.name = name;
    if (email) educator.email = email;
    if (phoneNumber) educator.phoneNumber = phoneNumber;
    if (status !== undefined) educator.status = Number(status);

    // Initialize profile if it doesn't exist
    if (!educator.profile) {
      educator.profile = {};
    }

    // Ensure socialLinks exists to prevent validation errors
    if (!educator.profile.socialLinks) {
      educator.profile.socialLinks = {};
    }

    // Update profile fields only if they are provided
    if (address) educator.profile.address = address;
    if (zipcode) educator.profile.zipcode = zipcode;
    if (state) educator.profile.state = state;
    if (category) educator.profile.category = category; // Add category field
    if (schoolName) educator.profile.schoolName = schoolName; // Add school/university name field

    // Update avatar if profile image was uploaded
    if (req.file) {
      console.log('Profile image uploaded:', req.file);
      educator.profile.avatar = `/uploads/profiles/${req.file.filename}`;
      console.log('Updated avatar path:', educator.profile.avatar);
    } else {
      console.log('No profile image uploaded in the request');
    }

    if (roleId) {
      educator.roleRef = roleId;
    }

    await educator.save();
    res.json({
      educator,
      msg: 'Educator updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating educator', error: error.message });
  }
};