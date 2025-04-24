const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendOTP, verifyOTP } = require('../utils/otp');
const { formatPhoneNumber } = require('../utils/phoneUtils');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Request OTP controller
exports.requestOTP = catchAsync(async (req, res, next) => {
  // 1) Validate request body
  const { email, phoneNumber } = req.body;

  // 2) Check if email and phone number exist
  if (!email || !phoneNumber) {
    return next(new AppError('Please provide email and phone number', 400));
  }

  // Format phone number to ensure it has +91 prefix
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  // 3) Check if user exists
  let user = await User.findOne({ email, phoneNumber: formattedPhoneNumber });
  if (!user) {
    // Try without the formatting in case the user was stored with a different format
    const userAlt = await User.findOne({ email, phoneNumber });
    if (!userAlt) {
      return next(new AppError('No user found with this email and phone number', 404));
    }
    user = userAlt;
  }

  // Check if user is inactive
  if (user.status === 0) {
    return next(new AppError('Your account is inactive. Please contact the administrator.', 403));
  }

  // 4) Generate and send OTP
  const otpResult = await sendOTP(user);

  // 5) Handle delivery issues but still succeed
  if (!otpResult.success && !otpResult.smsRateLimited && !otpResult.emailDelivered) {
    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }

  // 6) Send response
  let message = 'OTP has been sent to your phone number and/or email';

  if (otpResult.simulated) {
    message = 'Development mode: OTP simulation active. Check console for OTP.';
  } else if (otpResult.smsRateLimited) {
    message = 'SMS limit reached. OTP sent to your email only.';
  }

  res.json({
    status: 'success',
    message,
    userId: user._id,
    debugOtp: otpResult.otp // Only included in development
  });
});

// Verify OTP controller (login)
exports.verifyOTP = catchAsync(async (req, res, next) => {
  // 1) Validate request body
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return next(new AppError('User ID and OTP are required', 400));
  }

  // 2) Verify OTP
  const verificationResult = await verifyOTP(userId, otp);

  if (!verificationResult.valid) {
    return next(new AppError(verificationResult.message, 401));
  }

  const user = verificationResult.user;

  // 3) Generate tokens
  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // 4) Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 5) Populate role reference if exists
  if (user.roleRef) {
    await user.populate('roleRef');
  }

  // 6) Send response
  res.json({
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      roleRef: user.roleRef ? user.roleRef._id : null,
      permissions: user.roleRef ? user.roleRef.permissions : null
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
  const user = await User.findById(decoded.id).populate('roleRef');
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Check if user is inactive
  if (user.status === 0) {
    return next(new AppError('Your account is inactive. Please contact the administrator.', 403));
  }

  // 3) Generate new access token
  const accessToken = generateToken(user._id, user.role);

  res.json({
    status: 'success',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      roleRef: user.roleRef ? user.roleRef._id : null,
      permissions: user.roleRef ? user.roleRef.permissions : null
    }
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

// Forgot password (reset via OTP) controller
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // Ensure phone number has +91 prefix for SMS delivery
  if (user.phoneNumber) {
    user.phoneNumber = formatPhoneNumber(user.phoneNumber);
  }

  // 2) Generate and send OTP
  const otpResult = await sendOTP(user);

  // 3) Handle delivery issues but still succeed if possible
  if (!otpResult.success && !otpResult.smsRateLimited && !otpResult.emailDelivered) {
    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }

  // 4) Send response
  let message = 'OTP has been sent to your phone number and/or email';

  if (otpResult.simulated) {
    message = 'Development mode: OTP simulation active. Check console for OTP.';
  } else if (otpResult.smsRateLimited) {
    message = 'SMS limit reached. OTP sent to your email only.';
  }

  res.json({
    status: 'success',
    message,
    userId: user._id,
    debugOtp: otpResult.otp // Only included in development
  });
});

// Reset password with OTP controller
exports.resetPassword = catchAsync(async (req, res, next) => {
  // No longer needed as we're using OTP-based authentication without passwords
  return next(new AppError('Password reset is not supported in OTP-based authentication', 400));
});