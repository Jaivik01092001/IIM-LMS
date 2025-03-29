const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: 'User not found' });

  // Generate reset token
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const resetLink = `http://yourdomain.com/reset-password?token=${resetToken}`;

  // Send email
  await sendEmail(
    email,
    'Password Reset Request',
    `Click this link to reset your password: ${resetLink}`
  );

  res.json({ msg: 'Password reset link sent to your email' });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ msg: 'Invalid token' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ msg: 'Token expired or invalid' });
  }
};