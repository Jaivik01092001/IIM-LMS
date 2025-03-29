const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createEducator = async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const educator = new User({
    email,
    password: hashedPassword,
    role: 'educator',
    name,
    university: req.user.id,
  });
  await educator.save();
  res.json(educator);
};

exports.getEducators = async (req, res) => {
  const educators = await User.find({ university: req.user.id, role: 'educator' });
  res.json(educators);
};

exports.updateEducator = async (req, res) => {
  const { name, email } = req.body;
  const educator = await User.findById(req.params.id);
  if (educator.university.toString() !== req.user.id) {
    return res.status(403).json({ msg: 'Unauthorized' });
  }
  educator.name = name || educator.name;
  educator.email = email || educator.email;
  await educator.save();
  res.json(educator);
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