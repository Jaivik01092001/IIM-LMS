const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createEducator = async (req, res) => {
  const { email, password, name, userId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const educator = new User({
    email,
    password: hashedPassword,
    role: 'educator',
    name,
    university: userId,
  });
  await educator.save();
  res.json(educator);
};

exports.getEducators = async (req, res) => {
  const educators = await User.find({ university: req.body.userId, role: 'educator' });
  res.json(educators);
};

exports.updateEducator = async (req, res) => {
  const { name, email, userId } = req.body;
  const educator = await User.findById(req.params.id);
  if (educator.university.toString() !== userId) {
    return res.status(403).json({ msg: 'Unauthorized' });
  }
  educator.name = name || educator.name;
  educator.email = email || educator.email;
  await educator.save();
  res.json(educator);
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
    return res.status(400).json({ msg: "New passwords do not match" });
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error(`User not found for userId: ${userId}`);
    return res.status(404).json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    console.warn(`Invalid current password attempt for userId: ${userId}`);
    return res.status(400).json({ msg: "Invalid current password" });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  console.debug(`Password updated successfully for userId: ${userId}`);
  res.json({ msg: "Password updated" });
};