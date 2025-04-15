const Course = require('../models/Course');
const Content = require('../models/Content');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

const getCourses = async (req, res) => {
  const { search, filter } = req.query;
  let query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (filter) query.status = filter;
  const courses = await Course.find(query).populate('creator', 'name');
  res.json(courses);
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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
  const courses = await Course.find({ 'enrolledUsers.user': req.user.id }).populate('content');
  res.json(courses);
};

const getCourseDetail = async (req, res) => {

  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name')
      .populate('content')
      .populate('quizzes')
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
      .populate('content');

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
    let query = { status: 'approved' };
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
    const content = await Content.find({ creator: req.user.id })
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
    const { title, description, type } = req.body;

    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }

    const fileUrl = req.file ? req.file.path : null;

    const content = new Content({
      title,
      description,
      fileUrl,
      type: type || 'document',
      creator: req.user.id,
    });

    await content.save();

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
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not enrolled in this course' });
    }

    // Calculate score
    let score = 0;
    let total = course.quiz.length;

    course.quiz.forEach(q => {
      if (answers[q._id] === q.answer) score++;
    });

    const passed = score === total;
    const percentage = Math.round((score / total) * 100);

    // Update user's enrollment status if passed
    if (passed) {
      const enrolled = course.enrolledUsers.find(e => e.user.toString() === req.user.id);
      enrolled.status = 'completed';
      enrolled.completedAt = new Date();
      enrolled.progress = 100;

      // Generate certificate (simplified)
      const certificateId = `${course._id}_${req.user.id}_${Date.now()}`;
      course.certificateUrl = `https://cloudinary.com/certificate_${certificateId}`;

      await course.save();
    }

    res.json({
      score,
      total,
      percentage,
      passed,
      certificateUrl: passed ? course.certificateUrl : null
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields
    user.profile.phone = phone || user.profile.phone;
    user.profile.address = address || user.profile.address;
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