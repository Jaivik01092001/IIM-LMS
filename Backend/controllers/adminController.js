const Content = require("../models/Content");
const Course = require("../models/Course");
const User = require("../models/User");
const Module = require("../models/Module");
const Quiz = require("../models/Quiz");
const bcrypt = require("bcryptjs");
const { formatPhoneNumber } = require("../utils/phoneUtils");

exports.getUniversities = async (req, res) => {
  try {
    // Return all users with role='university' regardless of status
    const universities = await User.find({ role: "university" })
      .populate("educators", "name email phoneNumber status")
      .select(
        "-password -refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpires"
      );
    res.json(universities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving universities", error: error.message });
  }
};

exports.createUniversity = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request files:", req.files);

    // Log all keys in the request body
    console.log("Request body keys:", Object.keys(req.body));

    // Extract fields from form data
    // Handle both direct fields and FormData
    const name = req.body.name || req.body.schoolName;
    const email = req.body.email;
    const roleId = req.body.roleId;
    const phoneNumber =
      req.body.phoneNumber ||
      (req.body.phone ? req.body.phone.replace(/^\+91\s*/, "") : null);
    const address = req.body.address;
    const zipcode = req.body.zipcode;
    const state = req.body.state;
    const contactPerson = req.body.contactPerson || req.body.ownerName;

    console.log("Extracted fields:", {
      name,
      email,
      phoneNumber,
      contactPerson,
      rawName: req.body.name,
      rawSchoolName: req.body.schoolName,
      rawEmail: req.body.email,
      rawPhoneNumber: req.body.phoneNumber,
      rawPhone: req.body.phone,
    });

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          name: name ? "provided" : "missing",
          email: email ? "provided" : "missing",
          phoneNumber: phoneNumber ? "provided" : "missing",
        },
      });
    }

    // Check if university with this email already exists
    const existingUniversity = await User.findOne({
      email,
      role: "university",
    });
    if (existingUniversity) {
      return res
        .status(400)
        .json({ message: "University with this email already exists" });
    }

    // Create a new university user without password (using OTP-based login)
    // Using standardized role mapping: UI: School Admin -> DB: university
    const universityUser = new User({
      email,
      role: "university", // DB role value for School Admin
      name,
      phoneNumber,
      roleRef: roleId || undefined, // Assign role if provided
      contactPerson,
      educators: [],
      profile: {
        address,
        zipcode,
        state,
        avatar: req.file ? `/uploads/profiles/${req.file.filename}` : null,
      },
    });

    await universityUser.save();

    // Return the university user without sensitive fields
    const universityData = await User.findById(universityUser._id).select(
      "-password -refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpires"
    );

    res.json(universityData);
  } catch (error) {
    next(error);
  }
};

exports.getUniversityById = async (req, res) => {
  try {
    const university = await User.findOne({
      _id: req.params.id,
      role: "university",
    })
      .populate("educators", "name email phoneNumber status")
      .select(
        "-password -refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpires"
      );

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    res.json(university);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving university", error: error.message });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const university = await User.findOne({
      _id: req.params.id,
      role: "university",
    });

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    // Soft delete - update status to 0 (inactive)
    university.status = 0;
    await university.save();

    res.json({ message: "University deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting university", error: error.message });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    console.log("Update university request received for ID:", req.params.id);
    console.log("Update university request body:", req.body);
    console.log("Update university request file:", req.file);
    console.log("Request headers:", req.headers);
    console.log("Request method:", req.method);

    // Extract fields from form data
    // Handle both direct fields and FormData
    const name = req.body.name || req.body.schoolName;
    const email = req.body.email;
    const phone = req.body.phone;
    const phoneNumber =
      req.body.phoneNumber || (phone ? phone.replace(/^\+91\s*/, "") : null);
    const address = req.body.address;
    const zipcode = req.body.zipcode;
    const state = req.body.state;
    const contactPerson = req.body.contactPerson || req.body.ownerName;
    const status = req.body.status;
    const keepExistingImage = req.body.keepExistingImage;

    console.log("Extracted update fields:", {
      name,
      email,
      phoneNumber,
      contactPerson,
      status,
      address,
      zipcode,
      state,
      keepExistingImage,
    });

    const university = await User.findOne({
      _id: req.params.id,
      role: "university",
    });

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    // Update basic fields
    if (name) university.name = name;
    if (email) university.email = email;
    if (phoneNumber) university.phoneNumber = phoneNumber;
    if (phone) university.phoneNumber = phone.replace(/^\+91\s*/, "");
    if (contactPerson) university.contactPerson = contactPerson;

    // Update profile fields
    university.profile = university.profile || {};
    if (address) university.profile.address = address;
    if (zipcode) university.profile.zipcode = zipcode;
    if (state) university.profile.state = state;

    // Update profile image if provided
    if (req.file) {
      university.profile.avatar = `/uploads/profiles/${req.file.filename}`;
      console.log("Updated profile image to:", university.profile.avatar);
    } else if (req.body.keepExistingImage === "true") {
      // Keep existing image, no need to update
      console.log("Keeping existing profile image:", university.profile.avatar);
    }

    // Handle status update if provided
    if (status !== undefined) {
      university.status = Number(status);
    }

    // Handle roleId update if provided
    if (req.body.roleId) {
      university.roleRef = req.body.roleId;
      console.log("Updated roleRef to:", req.body.roleId);
      // Note: We no longer update the core role field, it remains fixed as "university"
    }

    await university.save();

    // Return updated university without sensitive fields
    const updatedUniversity = await User.findById(university._id)
      .populate("educators", "name email phoneNumber status")
      .select(
        "-password -refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpires"
      );

    res.json(updatedUniversity);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating university", error: error.message });
  }
};

exports.getContent = async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = { activeStatus: 1 }; // Only return active content

    if (search) query.title = { $regex: search, $options: "i" };
    if (filter) query.status = filter;

    const content = await Content.find(query).populate("creator", "name");
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving content", error: error.message });
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
      return res.status(400).json({ msg: "File upload failed" });
    }

    // Determine media type based on file extension
    let mediaType = "document";
    let mimeType = req.file.mimetype;
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();

    if (["mp4", "mov", "avi", "mkv"].includes(fileExt)) {
      mediaType = "video";
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
      mediaType = "image";
    }

    const content = new Content({
      title,
      description,
      fileUrl,
      creator: req.user.id,
      status: "approved",
      type:
        type ||
        (mediaType === "video"
          ? "video"
          : mediaType === "image"
          ? "image"
          : "document"),
      mediaType,
      mimeType,
      size: req.file.size,
      module: moduleId || null,
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
    res.status(500).json({ msg: error.message || "Server Error" });
  }
};

exports.updateContent = async (req, res) => {
  const { title, description } = req.body;
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ msg: "Content not found" });
  content.title = title || content.title;
  content.description = description || content.description;
  await content.save();
  res.json(content);
};
exports.approveContent = async (req, res) => {
  const content = await Content.findById(req.params.id);
  content.status = "approved";
  await content.save();
  res.json(content);
};

exports.rejectContent = async (req, res) => {
  const content = await Content.findById(req.params.id);
  content.status = "rejected";
  await content.save();
  res.json(content);
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Soft delete - update activeStatus to 0 (inactive)
    content.activeStatus = 0;
    await content.save();

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting content", error: error.message });
  }
};

// Get all courses (both active and inactive)
exports.getCourses = async (req, res) => {
  try {
    // Return all courses regardless of status
    const courses = await Course.find().populate("creator", "name");
    res.json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving courses", error: error.message });
  }
};

// Get a specific course with its content, modules, and quizzes
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("creator", "name")
      .populate("content")
      .populate({
        path: "modules",
        populate: [
          {
            path: "content",
            model: "Content",
          },
          {
            path: "quiz",
            model: "Quiz",
          },
        ],
      })
      .populate({
        path: "quizzes",
        // Include all quiz fields including questions
        select: "title description questions timeLimit passingScore attempts",
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error retrieving course:", error);
    res
      .status(500)
      .json({ message: "Error retrieving course", error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    console.log("Create course route hit");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);

    // Debug uploaded files
    console.log("Uploaded Files:");
    if (req.files && req.files.length > 0) {
      req.files.forEach((f, i) => {
        console.log(`${i + 1}. ${f.fieldname} -> ${f.originalname}`);
      });
    }

    // Destructure fields from request body
    const {
      title,
      description,
      duration,
      language,
      level,
      thumbnailUrl,
      hasModules,
      modules,
      content,
      quizzes,
      status,
      isDraft,
    } = req.body;

    // ✅ Use thumbnail from req.files (upload.any())
    let thumbnail = thumbnailUrl;
    const thumbnailFile = req.files?.find((f) => f.fieldname === "thumbnail");
    if (thumbnailFile) {
      thumbnail = thumbnailFile.path;
    }

    // 🧠 Helper function to parse JSON safely
    const tryParse = (data) => {
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch (err) {
        console.error("Parse error:", err.message);
        return [];
      }
    };

    const parsedModules = tryParse(modules);
    const parsedContent = tryParse(content);
    const parsedQuizzes = tryParse(quizzes);

    // 🔎 Parse contentFileIds
    let contentFileIds = req.body.contentFileIds || [];
    if (!Array.isArray(contentFileIds)) {
      contentFileIds = [contentFileIds];
    }

    const contentItems = [];

    // Process uploaded files and text content
    if (parsedContent && parsedContent.length > 0) {
      // Process text content items first - they don't need file uploads
      const textContentPromises = parsedContent
        .filter((item) => item.type === "text")
        .map(async (item) => {
          console.log(`Creating text content item: ${item.title}`);
          const textContentDoc = new Content({
            title: item.title,
            description: item.description,
            textContent: item.textContent || "",
            creator: req.user.id,
            status: "approved",
            type: "text",
            mediaType: "text",
            mimeType: "text/html",
            module: null,
          });

          await textContentDoc.save();
          console.log(`Created text content with ID: ${textContentDoc._id}`);

          return {
            id: item._id,
            dbId: textContentDoc._id,
          };
        });

      const textContentItems = await Promise.all(textContentPromises);
      contentItems.push(...textContentItems);
      console.log(`Processed ${textContentItems.length} text content items`);
    }

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        if (file.fieldname === "thumbnail") continue;

        const fieldnameParts = file.fieldname.match(/\[(\d+)\]/);
        if (!fieldnameParts) continue;

        const index = parseInt(fieldnameParts[1]);
        const contentId = contentFileIds[index];
        if (!contentId) continue;

        const contentItem = parsedContent.find(
          (item) => item._id === contentId
        );
        if (!contentItem) continue;

        const fileExt = file.originalname.split(".").pop().toLowerCase();
        const mimeType = file.mimetype;

        let mediaType = "document";
        if (["mp4", "mov", "avi", "mkv"].includes(fileExt)) mediaType = "video";
        else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt))
          mediaType = "image";

        const contentDoc = new Content({
          title: contentItem.title,
          description: contentItem.description,
          fileUrl: file.path,
          creator: req.user.id,
          status: "approved",
          type: contentItem.type || mediaType,
          mediaType,
          mimeType,
          size: file.size,
          module: null,
        });

        await contentDoc.save();
        contentItems.push({ id: contentId, dbId: contentDoc._id });
      }
    }

    // ✅ Create course
    const course = new Course({
      title,
      description,
      duration,
      language: language || "en",
      level: level || "beginner",
      thumbnail,
      hasModules: true, // Always use modules
      modules: [],
      content: contentItems.map((item) => item.dbId),
      quizzes: [],
      status: status !== undefined ? Number(status) : 1,
      isDraft: isDraft === "true" || isDraft === true,
      creator: req.user.id,
    });

    await course.save();

    // ✅ Handle Modules + Quizzes
    if (parsedModules && parsedModules.length > 0) {
      for (const moduleData of parsedModules) {
        const newModule = new Module({
          title: moduleData.title || "Untitled Module",
          description: moduleData.description || "",
          course: course._id,
          order: moduleData.order || 0,
          content: [],
        });

        await newModule.save();
        course.modules.push(newModule._id);

        // Module content
        if (Array.isArray(moduleData.content)) {
          for (const contentId of moduleData.content) {
            const newContentItem = contentItems.find(
              (item) => item.id === contentId
            );
            if (newContentItem) {
              const dbContentId = newContentItem.dbId;
              newModule.content.push(dbContentId);

              const contentExists = await Content.findById(dbContentId);
              if (contentExists) {
                contentExists.module = newModule._id;
                await contentExists.save();
              }
            } else if (!contentId.startsWith("temp_")) {
              try {
                const contentExists = await Content.findById(contentId);
                if (contentExists) {
                  newModule.content.push(contentId);
                  contentExists.module = newModule._id;
                  await contentExists.save();
                }
              } catch (err) {
                console.error(`Invalid content ID: ${contentId}`);
              }
            }
          }
          await newModule.save();
        }

        // Module quiz
        if (moduleData.quiz) {
          const quizData = moduleData.quiz;

          const quiz = new Quiz({
            title: quizData.title || `${newModule.title} Quiz`,
            description: quizData.description || `Quiz for ${newModule.title}`,
            course: course._id,
            questions: quizData.questions || [],
            timeLimit: quizData.timeLimit || 30,
            passingScore: quizData.passingScore || 60,
          });

          await quiz.save();
          newModule.quiz = quiz._id;
          await newModule.save();
          course.quizzes.push(quiz._id);
        }
      }

      await course.save();
    }

    // ✅ Final Response
    res.status(201).json({
      message: "Course created successfully",
      course,
      contentItemsCreated: contentItems.map((c) => c.dbId),
      uploadedFiles: req.files.map((f) => f.fieldname),
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      language,
      level,
      thumbnailUrl,
      modules,
      content,
      quizzes,
      status,
      isDraft,
    } = req.body;

    console.log("Update course data:", req.body);

    // Debug uploaded files
    console.log("Uploaded Files:");
    if (req.files && req.files.length > 0) {
      req.files.forEach((f, i) => {
        console.log(`${i + 1}. ${f.fieldname} -> ${f.originalname}`);
      });
    } else {
      console.log("No files uploaded in the request");
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update fields if provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (language) course.language = language;
    if (level) course.level = level;

    // Handle thumbnail update
    // Check for thumbnail in req.files array since we're using upload.any()
    const thumbnailFile = req.files?.find((f) => f.fieldname === "thumbnail");
    if (thumbnailFile) {
      course.thumbnail = thumbnailFile.path;
      console.log("Updated thumbnail to:", thumbnailFile.path);
    } else if (thumbnailUrl) {
      course.thumbnail = thumbnailUrl;
      console.log("Using provided thumbnailUrl:", thumbnailUrl);
    }

    // No array fields to parse anymore

    // Always use modules
    course.hasModules = true;

    if (modules) {
      try {
        const parsedModules =
          typeof modules === "string" ? JSON.parse(modules) : modules;
        console.log("Parsed modules in update:", parsedModules);

        // Handle module updates
        if (Array.isArray(parsedModules)) {
          // Get existing module IDs
          const existingModuleIds = course.modules.map((id) => id.toString());

          // Process each module in the update
          for (const moduleData of parsedModules) {
            if (
              moduleData._id &&
              existingModuleIds.includes(moduleData._id.toString())
            ) {
              // Update existing module
              const existingModule = await Module.findById(moduleData._id);
              if (existingModule) {
                existingModule.title = moduleData.title || existingModule.title;
                existingModule.description =
                  moduleData.description || existingModule.description;
                existingModule.order =
                  moduleData.order !== undefined
                    ? moduleData.order
                    : existingModule.order;

                // Update content associations if provided
                if (moduleData.content && Array.isArray(moduleData.content)) {
                  // Replace temporary content IDs with database IDs
                  const updatedContent = [];

                  for (const contentId of moduleData.content) {
                    // Check if this is a newly created content item
                    const newContentItem = contentItems.find(
                      (item) => item.id === contentId
                    );

                    if (newContentItem) {
                      // Use the database ID for newly created content
                      updatedContent.push(newContentItem.dbId);
                    } else if (!contentId.startsWith("temp_")) {
                      // Only include non-temporary IDs that are valid ObjectIds
                      try {
                        // Verify this is a valid content ID
                        const contentExists = await Content.findById(contentId);
                        if (contentExists) {
                          updatedContent.push(contentId);
                        }
                      } catch (err) {
                        console.error(
                          `Error finding content with ID ${contentId}:`,
                          err.message
                        );
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
                      console.error(
                        `Error updating content reference for ID ${contentId}:`,
                        err.message
                      );
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
                      existingQuiz.description =
                        quizData.description || existingQuiz.description;
                      existingQuiz.questions =
                        quizData.questions || existingQuiz.questions;
                      existingQuiz.timeLimit =
                        quizData.timeLimit || existingQuiz.timeLimit;
                      existingQuiz.passingScore =
                        quizData.passingScore || existingQuiz.passingScore;

                      await existingQuiz.save();
                    }
                  } else {
                    // Create new quiz
                    const quiz = new Quiz({
                      title: quizData.title || `${existingModule.title} Quiz`,
                      description:
                        quizData.description ||
                        `Quiz for ${existingModule.title}`,
                      course: course._id,
                      questions: quizData.questions || [],
                      timeLimit: quizData.timeLimit || 30,
                      passingScore: quizData.passingScore || 60,
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
                title: moduleData.title || "Untitled Module",
                description: moduleData.description || "",
                course: course._id,
                order: moduleData.order || 0,
                content: [], // Initialize with empty content array
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
                  const newContentItem = contentItems.find(
                    (item) => item.id === contentId
                  );

                  if (newContentItem) {
                    // Use the database ID for newly created content
                    updatedContent.push(newContentItem.dbId);
                  } else if (!contentId.startsWith("temp_")) {
                    // Only include non-temporary IDs that are valid ObjectIds
                    try {
                      // Verify this is a valid content ID
                      const contentExists = await Content.findById(contentId);
                      if (contentExists) {
                        updatedContent.push(contentId);
                      }
                    } catch (err) {
                      console.error(
                        `Error finding content with ID ${contentId}:`,
                        err.message
                      );
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
                    console.error(
                      `Error updating content reference for ID ${contentId}:`,
                      err.message
                    );
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
                  description:
                    quizData.description || `Quiz for ${newModule.title}`,
                  course: course._id,
                  questions: quizData.questions || [],
                  timeLimit: quizData.timeLimit || 30,
                  passingScore: quizData.passingScore || 60,
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
            .filter((m) => m._id)
            .map((m) => m._id.toString());

          const modulesToRemove = existingModuleIds.filter(
            (id) => !updatedModuleIds.includes(id)
          );

          if (modulesToRemove.length > 0) {
            // Remove modules from course
            course.modules = course.modules.filter(
              (id) => !modulesToRemove.includes(id.toString())
            );

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
    const contentFileIds = req.body.contentFileIds
      ? Array.isArray(req.body.contentFileIds)
        ? req.body.contentFileIds
        : [req.body.contentFileIds]
      : [];

    // Parse content if it's a string
    let parsedContent;
    try {
      parsedContent =
        typeof content === "string" ? JSON.parse(content) : content || [];
    } catch (err) {
      console.error("Error parsing content JSON:", err);
      parsedContent = [];
    }

    // Create content items for uploaded files
    const contentItems = [];

    // Process content files if any
    if (
      req.files &&
      req.files.length > 0 &&
      contentFileIds &&
      contentFileIds.length > 0
    ) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Skip the thumbnail file
        if (file.fieldname === "thumbnail") continue;

        // Extract the index from the fieldname (contentFiles[0], contentFiles[1], etc.)
        const fieldnameParts = file.fieldname.match(/\[(\d+)\]/);
        if (!fieldnameParts) continue;

        const index = parseInt(fieldnameParts[1]);
        const contentId = contentFileIds[index];

        if (!contentId) {
          console.warn(`Missing content ID for file index ${index}`);
          continue;
        }

        // Find the content details in the content array
        const contentItem = parsedContent.find(
          (item) => item._id === contentId
        );
        if (!contentItem) {
          console.warn(`Content item not found for ID: ${contentId}`);
          continue;
        }

        let mediaType = "document";
        let mimeType = file.mimetype;
        const fileExt = file.originalname.split(".").pop().toLowerCase();

        if (["mp4", "mov", "avi", "mkv"].includes(fileExt)) {
          mediaType = "video";
        } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
          mediaType = "image";
        }

        // Create a new content item
        const newContent = new Content({
          title: contentItem.title,
          description: contentItem.description,
          fileUrl: file.path,
          creator: req.user.id,
          status: "approved",
          type:
            contentItem.type ||
            (mediaType === "video"
              ? "video"
              : mediaType === "image"
              ? "image"
              : "document"),
          mediaType,
          mimeType,
          size: file.size,
          module: contentItem.module || null,
        });

        await newContent.save();
        contentItems.push({
          id: contentId,
          dbId: newContent._id,
        });
      }
    }

    // Update course content
    if (content) {
      try {
        // Process text content items separately - these don't need file uploads
        const textContentPromises = parsedContent
          .filter((item) => item.type === "text")
          .map(async (item) => {
            // If it's not a temp item (already exists in DB), skip creation
            if (!item._id.startsWith("temp_")) {
              // Update existing text content if it's been edited
              if (item.textContent) {
                try {
                  const existingContent = await Content.findById(item._id);
                  if (existingContent) {
                    existingContent.title = item.title;
                    existingContent.description = item.description;
                    existingContent.textContent = item.textContent;
                    await existingContent.save();
                    console.log(`Updated existing text content: ${item._id}`);
                  }
                } catch (err) {
                  console.error(
                    `Error updating existing text content: ${item._id}`,
                    err
                  );
                }
              }
              return null;
            }

            // Create new text content
            console.log(`Creating new text content item: ${item.title}`);
            const newTextContent = new Content({
              title: item.title,
              description: item.description,
              textContent: item.textContent || "",
              creator: req.user.id,
              status: "approved",
              type: "text",
              mediaType: "text",
              mimeType: "text/html",
              module: item.module || null,
            });

            await newTextContent.save();
            console.log(`Created text content with ID: ${newTextContent._id}`);

            return {
              id: item._id,
              dbId: newTextContent._id,
            };
          });

        // Filter out null values from items that don't need creation
        const textContentItemsResults = await Promise.all(textContentPromises);
        const textContentItems = textContentItemsResults.filter(
          (item) => item !== null
        );

        contentItems.push(...textContentItems);
        console.log(`Processed ${textContentItems.length} text content items`);

        // Replace temporary IDs with database IDs for newly created content
        if (contentItems.length > 0) {
          // Filter out content items that have been replaced with new uploads
          parsedContent = parsedContent.filter(
            (item) =>
              !contentItems.some(
                (newItem) => newItem && newItem.id === item._id
              )
          );

          // Add the newly created content items
          course.content = [
            ...parsedContent,
            ...contentItems.map((item) => item.dbId),
          ];
        } else {
          course.content = parsedContent;
        }
      } catch (err) {
        console.error("Error processing content update:", err);
      }
    }

    if (quizzes) {
      try {
        course.quizzes =
          typeof quizzes === "string" ? JSON.parse(quizzes) : quizzes;
      } catch (err) {
        console.error("Error parsing quizzes JSON:", err);
      }
    }

    // Handle status and draft status update if provided
    if (status !== undefined) {
      course.status = Number(status);
    }

    if (isDraft !== undefined) {
      course.isDraft = isDraft === "true" || isDraft === true;
    }

    // Save the updated course
    await course.save();
    res.json(course);
  } catch (error) {
    console.error("Course update error:", error);
    res
      .status(500)
      .json({ message: "Error updating course", error: error.message });
  }
};

// Delete a course (soft delete)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Soft delete - update status to 0 (inactive)
    course.status = 0;
    await course.save();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: error.message });
  }
};

// Add content to a course
exports.addContentToCourse = async (req, res) => {
  try {
    const { courseId, contentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Add content to course if not already added
    if (!course.content.includes(contentId)) {
      course.content.push(contentId);
      await course.save();
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({
      message: "Error adding content to course",
      error: error.message,
    });
  }
};

// Add quiz to a course
exports.addQuizToCourse = async (req, res) => {
  try {
    const { courseId, quizId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if quiz is already in the course
    if (!course.quizzes.includes(quizId)) {
      course.quizzes.push(quizId);
      await course.save();
    }

    res.json(course);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding quiz to course", error: error.message });
  }
};

// Create a quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, questions, timeLimit, passingScore } =
      req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const Quiz = require("../models/Quiz");
    const quiz = new Quiz({
      title,
      description,
      course: courseId,
      questions: questions || [],
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 60,
    });

    await quiz.save();

    // Add quiz to course if not added automatically
    if (!course.quizzes.includes(quiz._id)) {
      course.quizzes.push(quiz._id);
      await course.save();
    }

    res.status(201).json(quiz);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, passingScore } = req.body;
    const { quizId } = req.params;

    const Quiz = require("../models/Quiz");
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    if (questions) quiz.questions = questions;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating quiz", error: error.message });
  }
};

// Get all quizzes
exports.getQuizzes = async (_, res) => {
  try {
    const Quiz = require("../models/Quiz");
    const quizzes = await Quiz.find().populate("course", "title");

    res.json(quizzes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving quizzes", error: error.message });
  }
};

// Get a specific quiz
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const Quiz = require("../models/Quiz");
    const quiz = await Quiz.findById(quizId).populate("course", "title");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving quiz", error: error.message });
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
    return res.status(400).json({ msg: "New passwords do not match" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid current password" });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ msg: "Password updated" });
};

// Get all users (admin, university, educator)
exports.getAllUsers = async (_, res) => {
  try {
    // Return all users regardless of status
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};
// Get all educators
exports.getAllEducators = async (_, res) => {
  try {
    // Return all educators regardless of status or university
    const educators = await User.find({ role: "educator" })
      .populate("university", "name category")
      .populate("roleRef", "name") // Populate the role reference
      .select("-password");
    res.json(educators);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving educators", error: error.message });
  }
};

// Create educator
exports.createEducator = async (req, res, next) => {
  try {
    const {
      email,
      name,
      roleId,
      phoneNumber,
      address,
      zipcode,
      state,
      category,
      schoolName,
    } = req.body;

    console.log("Admin creating educator with roleId:", roleId);

    // Prepare profile object
    const profile = {
      address,
      zipcode,
      state,
      category,
      schoolName,
      socialLinks: {},
    };

    // Add avatar if profile image was uploaded
    if (req.file) {
      profile.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // We always use "educator" as the core role value
    // The roleId only updates the roleRef field for permissions
    const educator = new User({
      email,
      role: "educator", // Fixed core role value
      name,
      phoneNumber,
      roleRef: roleId || undefined, // Assign role if provided
      profile,
    });

    console.log(
      "Admin controller - Creating educator with fixed role 'educator' and roleRef:",
      roleId
    );

    await educator.save();
    res.json(educator);
  } catch (error) {
    next(error);
  }
};

// Get educator by ID
exports.getEducatorById = async (req, res) => {
  try {
    const educator = await User.findOne({
      _id: req.params.id,
      role: "educator",
    })
      .populate("roleRef", "name") // Populate the role reference
      .select("-password");

    if (!educator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    console.log("Educator with populated roleRef:", educator);
    res.json(educator);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving educator", error: error.message });
  }
};

// Update educator
exports.updateEducator = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      zipcode,
      state,
      status,
      category,
      schoolName,
      roleId,
    } = req.body;
    const educator = await User.findById(req.params.id);

    if (!educator) {
      return res.status(404).json({ message: "Educator not found" });
    }

    // Only update fields that are provided
    if (name) educator.name = name;
    if (email) educator.email = email;
    if (phoneNumber) educator.phoneNumber = phoneNumber;
    if (status !== undefined) educator.status = Number(status);

    // Update only roleRef if roleId is provided
    if (roleId) {
      educator.roleRef = roleId;
      console.log("Admin controller - Updated roleRef:", roleId);
      // Note: We no longer update the core role field, it remains fixed as "educator"
    }

    // Initialize profile if it doesn't exist
    if (!educator.profile) {
      educator.profile = {};
    }

    // Update profile fields if provided
    if (address) educator.profile.address = address;
    if (zipcode) educator.profile.zipcode = zipcode;
    if (state) educator.profile.state = state;
    if (category) educator.profile.category = category;
    if (schoolName) educator.profile.schoolName = schoolName;

    // Handle profile image upload
    if (req.file) {
      educator.profile.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    await educator.save();
    res.json(educator);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating educator", error: error.message });
  }
};
