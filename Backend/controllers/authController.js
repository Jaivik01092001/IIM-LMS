const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Login controller
exports.login = catchAsync(async (req, res, next) => {
  // 1) Validate request body using Joi (to be implemented)
  const { email, password } = req.body;

  // 2) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 3) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  // 4) Generate tokens
  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // 5) Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 6) Send response
  res.json({
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Refresh token controller
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // 1) Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  // 2) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // 3) Generate new access token
  const accessToken = generateToken(user._id, user.role);

  res.json({
    status: 'success',
    accessToken
  });
});

// Logout controller
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // 1) Find user by refresh token
  const user = await User.findOne({ refreshToken });
  if (user) {
    // 2) Remove refresh token
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Forgot password controller
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // 2) Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // 3) Send email with reset link
  const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

  try {
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Forgot your password? Submit a request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`
    );

    res.json({
      status: 'success',
      message: 'Password reset link sent to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// Reset password controller
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return next(new AppError('Token, password, and confirm password are required', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Log the user in, send JWT
  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    message: 'Password reset successfully',
    accessToken,
    refreshToken
  });
});