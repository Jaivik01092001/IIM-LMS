const Course = require('../models/Course');
const Content = require('../models/Content');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

exports.getCourses = async (req, res) => {
  const { search, filter } = req.query;
  let query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (filter) query.status = filter;
  const courses = await Course.find(query).populate('creator', 'name');
  res.json(courses);
};

exports.enrollCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
    course.enrolledUsers.push({ user: req.user.id });
    await course.save();
  }
  res.json({ msg: 'Enrolled successfully' });
};

exports.getMyCourses = async (req, res) => {
  const courses = await Course.find({ 'enrolledUsers.user': req.user.id }).populate('content');
  res.json(courses);
};

exports.resumeCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course.enrolledUsers.some(e => e.user.toString() === req.user.id)) {
    return res.status(403).json({ msg: 'Not enrolled in this course' });
  }
  res.json(course); // Front-end can resume from here
};

exports.getContent = async (req, res) => {
  const { search, filter } = req.query;
  let query = { status: 'approved' };
  if (search) query.title = { $regex: search, $options: 'i' };
  if (filter) query.status = filter;
  const content = await Content.find(query).populate('creator', 'name');
  res.json(content);
};

exports.addComment = async (req, res) => {
  const { text } = req.body;
  const content = await Content.findById(req.params.id);
  content.comments.push({ user: req.user.id, text });
  await content.save();
  res.json(content);
};

exports.getMyContent = async (req, res) => {
  const content = await Content.find({ creator: req.user.id }).populate('creator', 'name');
  res.json(content);
};

exports.createContent = async (req, res) => {
  const { title, description } = req.body;
  const fileUrl = req.file ? req.file.path : null;
  const content = new Content({
    title,
    description,
    fileUrl,
    creator: req.user.id,
  });
  await content.save();
  res.json(content);
};

exports.submitQuiz = async (req, res) => {
  const { answers } = req.body; // { questionId: answer }
  const course = await Course.findById(req.params.id);
  let score = 0;
  course.quiz.forEach(q => {
    if (answers[q._id] === q.answer) score++;
  });
  if (score === course.quiz.length) {
    const enrolled = course.enrolledUsers.find(e => e.user.toString() === req.user.id);
    enrolled.status = 'completed';
    await course.save();
    // Generate certificate (simplified)
    course.certificateUrl = `https://cloudinary.com/certificate_${course._id}_${req.user.id}`;
    await course.save();
  }
  res.json({ score, total: course.quiz.length });
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
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid old password' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ msg: 'Password updated' });
};