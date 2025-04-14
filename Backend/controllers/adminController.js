const Content = require('../models/Content');
const Course = require('../models/Course');
const University = require('../models/University');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUniversities = async (req, res) => {
  const universities = await University.find().populate('educators');
  res.json(universities);
};

exports.createUniversity = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const universityUser = new User({
    email,
    password: hashedPassword,
    role: 'university',
    name,
  });
  await universityUser.save();
  const university = new University({ name, educators: [] });
  universityUser.university = university._id;
  await university.save();
  await universityUser.save();
  res.json(university);
};

exports.updateUniversity = async (req, res) => {
  const { name } = req.body;
  const university = await University.findById(req.params.id);
  university.name = name || university.name;
  await university.save();
  res.json(university);
};

exports.getContent = async (req, res) => {
  const { search, filter } = req.query;
  let query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (filter) query.status = filter;
  const content = await Content.find(query).populate('creator', 'name');
  res.json(content);
};

exports.createContent = async (req, res) => {
  const { title, description, userid } = req.body;
  const fileUrl = req.file ? req.file.path : null;
  const content = new Content({
    title,
    description,
    fileUrl,
    creator: userid,
    status: "approved", // Admin-created content is auto-approved
  });
  await content.save();
  res.json(content);
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
  await Content.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Content deleted' });
};

// Predefined courses (seed data can be added separately)
exports.getCourses = async (req, res) => {
  const courses = await Course.find().populate('creator', 'name');
  res.json(courses);
};

exports.updateProfile = async (req, res) => {
  const { name, phone, address, userId } = req.body;
  const user = await User.findById(userId);
  user.name = name || user.name;
  user.profile = { phone, address };
  await user.save();
  res.json(user);
};
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword, userId } = req.body;
  console.debug(`Updating password for userId: ${userId}`);

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    console.warn(`Password confirmation mismatch for userId: ${userId}`);
    return res.status(400).json({ msg: 'New passwords do not match' });
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error(`User not found for userId: ${userId}`);
    return res.status(404).json({ msg: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    console.warn(`Invalid current password attempt for userId: ${userId}`);
    return res.status(400).json({ msg: 'Invalid current password' });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  console.debug(`Password updated successfully for userId: ${userId}`);
  res.json({ msg: 'Password updated' });
};