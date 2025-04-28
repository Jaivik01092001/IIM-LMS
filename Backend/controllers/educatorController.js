const Course = require('../models/Course');
const Content = require('../models/Content');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const { formatPhoneNumber } = require('../utils/phoneUtils');

const getCourses = async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = { status: 1 }; // Only return active courses

    if (search) query.title = { $regex: search, $options: 'i' };
    if (filter && filter !== 'all') query.status = filter;

    const courses = await Course.find(query).populate('creator', 'name');
    res.json(courses);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if user is already enrolled
    if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
      course.enrolledUsers.push({
        user: req.user.id,
        status: 'in_progress',
        enrolledAt: new Date(),
        progress: 0
      });
      await course.save();

      // Initialize module progress for this user
      try {
        // Import the UserModuleProgress model
        const UserModuleProgress = require('../models/UserModuleProgress');

        // Check if progress record already exists
        const existingProgress = await UserModuleProgress.findOne({
          user: req.user.id,
          course: course._id
        });

        // Only create a new progress record if one doesn't exist
        if (!existingProgress) {
          // Initialize with first module unlocked, rest locked
          const moduleProgress = course.modules.map((module, index) => ({
            module: module._id,
            isCompleted: false,
            completedContent: [], // Start with NO completed content
            lastAccessedAt: new Date()
          }));

          // Create new progress record
          const newProgress = new UserModuleProgress({
            user: req.user.id,
            course: course._id,
            moduleProgress,
            lastAccessedModule: course.modules.length > 0 ? course.modules[0]._id : null
          });

          await newProgress.save();
          console.log('Module progress initialized for new enrollment');
        }
      } catch (progressError) {
        console.error('Error initializing module progress:', progressError);
        // Continue with enrollment even if progress initialization fails
      }
    }

    // Return updated course with enrollment status
    const updatedCourse = await Course.findById(req.params.id)
      .populate('creator', 'name')
      .populate('content');

    res.json({
      msg: 'Enrolled successfully',
      course: updatedCourse,
      enrollmentStatus: 'in_progress'
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getMyCourses = async (req, res) => {
  try {
    // Only return active courses (status = 1) that the user is enrolled in
    const courses = await Course.find({
      'enrolledUsers.user': req.user.id,
      status: 1
    })
      .populate('content')
      .populate({
        path: 'modules',
        populate: {
          path: 'content',
          model: 'Content'
        }
      });

    res.json(courses);
  } catch (error) {
    console.error('Error getting my courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

const getCourseDetail = async (req, res) => {
  try {
    // Only return active courses (status = 1)
    const course = await Course.findOne({ _id: req.params.id, status: 1 })
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
      })
      .populate('enrolledUsers.user', 'name');

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if the current user is enrolled
    const isEnrolled = course.enrolledUsers.some(e => {
      const userId = e.user._id ? e.user._id.toString() : e.user.toString();
      return userId === req.body.userId;
    });

    // Return course with enrollment status and user ID for frontend comparison
    res.json({
      ...course.toObject(),
      isEnrolled,
      currentUserId: req.user.id,
      enrollmentStatus: isEnrolled ?
        course.enrolledUsers.find(e => {
          const userId = e.user._id ? e.user._id.toString() : e.user.toString();
          return userId === req.user.id;
        }).status : null
    });
  } catch (error) {
    console.error('Error getting course details:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const resumeCourse = async (req, res) => {
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
      return res.status(404).json({ msg: 'Course not found' });
    }

    if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not enrolled in this course' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error resuming course:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getContent = async (req, res) => {
  try {
    const { search, filter, type } = req.query;

    // Build query
    let query = {
      status: 'approved',
      activeStatus: 1 // Only return active content
    };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (filter && filter !== 'all') query.status = filter;
    if (type && type !== 'all') query.type = type;

    // Get content with populated fields
    const content = await Content.find(query)
      .populate('creator', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    content.comments.push({
      user: req.user.id,
      text,
      date: new Date()
    });

    await content.save();

    // Populate user information in comments
    const populatedContent = await Content.findById(content._id)
      .populate('creator', 'name')
      .populate('comments.user', 'name');

    res.json({
      success: true,
      content: populatedContent
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getMyContent = async (req, res) => {
  try {
    // Only return active content (activeStatus = 1)
    const content = await Content.find({
      creator: req.user.id,
      activeStatus: 1
    })
      .populate('creator', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Error getting my content:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const createContent = async (req, res) => {
  try {
    const { title, description, type, moduleId } = req.body;

    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }

    const fileUrl = req.file ? req.file.path : null;

    // Determine media type based on file extension
    let mediaType = 'document';
    let mimeType = req.file ? req.file.mimetype : null;
    let fileSize = req.file ? req.file.size : 0;

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();

      if (['mp4', 'mov', 'avi', 'mkv'].includes(fileExt)) {
        mediaType = 'video';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        mediaType = 'image';
      }
    }

    const content = new Content({
      title,
      description,
      fileUrl,
      type: type || (mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : 'document'),
      mediaType,
      mimeType,
      size: fileSize,
      module: moduleId || null,
      creator: req.user.id,
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

    // Populate creator information before returning
    const populatedContent = await Content.findById(content._id).populate('creator', 'name');

    res.json({
      success: true,
      content: populatedContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: answer }
    const { id: courseId, quizId } = req.params;

    // Find the course and quiz
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // For preview/testing purposes, we'll skip the enrollment check
    // In a production environment, you would uncomment this check
    /*
    // Check if user is enrolled
    if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not enrolled in this course' });
    }
    */

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    // Calculate total possible points from all questions
    const totalPossiblePoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    quiz.questions.forEach(question => {
      const questionId = question._id.toString();
      if (answers[questionId] === question.correctAnswer) {
        score += question.points || 1;
      }
    });

    const percentage = Math.round((score / totalPossiblePoints) * 100);
    const passed = percentage >= quiz.passingScore;

    // Create a new attempt record
    const attempt = {
      user: req.user.id,
      answers,
      score,
      totalPoints: totalPossiblePoints,
      percentage,
      passed,
      date: new Date()
    };

    // Add the attempt to the quiz
    quiz.attempts.push(attempt);
    await quiz.save();

    // Update user's enrollment status if passed
    if (passed) {
      // For preview/testing purposes, we'll skip the enrollment update
      // In a production environment, you would uncomment this code
      /*
      const enrolled = course.enrolledUsers.find(e => e.user.toString() === req.user.id);
      if (enrolled) {
        enrolled.status = 'completed';
        enrolled.completedAt = new Date();
        enrolled.progress = 100;
        await course.save();
      }
      */
      console.log('Quiz passed, would update enrollment status in production');
    }

    res.json({
      score,
      totalPoints: totalPossiblePoints,
      percentage,
      passed,
      attemptId: quiz.attempts[quiz.attempts.length - 1]._id
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, phoneNumber, address, bio, zipcode, state } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;

    // Update phone number if provided
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields
    user.profile.phone = phone || user.profile.phone;
    user.profile.address = address || user.profile.address;
    user.profile.zipcode = zipcode || user.profile.zipcode;
    user.profile.state = state || user.profile.state;
    user.profile.bio = bio || user.profile.bio;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ msg: 'Please provide both old and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid old password' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      msg: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const courseId = req.params.id;

    if (!progress || isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ msg: 'Invalid progress value' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Find the enrollment for the current user
    const enrollmentIndex = course.enrolledUsers.findIndex(e => e.user.toString() === req.user.id);

    if (enrollmentIndex === -1) {
      return res.status(400).json({ msg: 'You are not enrolled in this course' });
    }

    // Only update if the new progress is greater than the current progress
    if (progress > course.enrolledUsers[enrollmentIndex].progress) {
      course.enrolledUsers[enrollmentIndex].progress = progress;
      course.enrolledUsers[enrollmentIndex].lastAccessedAt = new Date();

      // If progress is 100%, mark as completed
      if (progress === 100) {
        course.enrolledUsers[enrollmentIndex].status = 'completed';
        course.enrolledUsers[enrollmentIndex].completedAt = new Date();

        // Trigger certificate generation
        // try {
        //   const certificateController = require('./certificateController');
        //   const certificateResult = await certificateController.generateCertificateInternal(req.user.id, course._id);

        //   if (certificateResult && certificateResult._id) {
        //     course.enrolledUsers[enrollmentIndex].certificate = certificateResult._id;
        //   }
        // } catch (certError) {
        //   console.error('Error generating certificate:', certError);
        //   // Continue with course completion even if certificate generation fails
        // }
      }

      await course.save();
    }

    res.json({
      msg: 'Progress updated successfully',
      progress: course.enrolledUsers[enrollmentIndex].progress,
      status: course.enrolledUsers[enrollmentIndex].status
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getCourses,
  enrollCourse,
  getMyCourses,
  getCourseDetail,
  resumeCourse,
  getContent,
  addComment,
  getMyContent,
  createContent,
  submitQuiz,
  updateProfile,
  updatePassword,
  updateProgress
};