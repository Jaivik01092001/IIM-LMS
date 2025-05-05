const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { formatPhoneNumber } = require('../utils/phoneUtils');

/**
 * Get logged in user information
 * @route GET /api/user/me
 * @access Private (All authenticated users)
 */
exports.getLoggedInUser = catchAsync(async (req, res, next) => {
  // The user object is already attached to the request by the auth middleware
  // We'll fetch a fresh copy with populated references
  const user = await User.findById(req.user.id)
    .populate('roleRef')
    .select('-refreshToken -otp -otpExpires -passwordResetToken -passwordResetExpires');

  // If user has university reference, populate it
  if (user.university) {
    await user.populate('university', 'name email profile.category');
  }

  // Format permissions for the response
  let permissions = {};
  if (user.roleRef && user.roleRef.permissions) {
    // Convert MongoDB Map to a plain JavaScript object if needed
    if (user.roleRef.permissions instanceof Map) {
      permissions = Object.fromEntries(user.roleRef.permissions);
    } else {
      permissions = user.roleRef.permissions;
    }
  } else {
    // Default permissions based on role
    if (user.role === 'university') {
      permissions = {
        view_courses: true,
        create_course: true,
        edit_course: true,
        delete_course: true,
        view_educators: true,
        create_educator: true,
        edit_educator: true,
        delete_educator: true,
        view_schools: true,
        view_blogs: true,
        view_quizzes: true,
        view_content: true,
      };
    } else if (user.role === 'educator') {
      permissions = {
        view_courses: true,
        view_blogs: true,
        view_quizzes: true,
        view_content: true,
      };
    } else if (user.role === 'admin' || user.role === 'staff') {
      // Admin and staff have all permissions
      permissions = { all: true };
    }
  }

  // Return user data
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        roleRef: user.roleRef ? {
          id: user.roleRef._id,
          name: user.roleRef.name,
        } : null,
        permissions,
        profile: user.profile,
        university: user.university,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * Update logged in user information
 * @route PUT /api/user/me
 * @access Private (All authenticated users)
 */
exports.updateLoggedInUser = catchAsync(async (req, res, next) => {
   console.log("Received file:", req.body);
  const { name, phoneNumber, address, zipcode, state, bio, email, role, university } = req.body || {};

  // Find the user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update basic user fields if provided
  if (name) user.name = name;

  // Update phone number if provided (with validation)
  if (phoneNumber) {
    // Check if the new phone number is already in use by another user
    const existingUser = await User.findOne({
      phoneNumber: formatPhoneNumber(phoneNumber),
      _id: { $ne: user._id } // Exclude current user
    });

    if (existingUser) {
      return next(new AppError('This phone number is already in use', 400));
    }

    user.phoneNumber = phoneNumber;
  }

  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
  }

  // Update profile fields if provided
  if (address) user.profile.address = address;
  if (zipcode) user.profile.zipcode = zipcode;
  if (state) user.profile.state = state;
  if (bio) user.profile.bio = bio;

  // Handle profile image if uploaded
  if (req.file) {
    user.profile.avatar = `uploads/profiles/${req.file.filename}`;
  }

  // Save the updated user
  await user.save();

  // Return updated user data (reuse the getLoggedInUser logic)
  // Populate role reference
  await user.populate('roleRef');

  // If user has university reference, populate it
  if (user.university) {
    await user.populate('university', 'name email profile.category');
  }

  // Format permissions for the response
  let permissions = {};
  if (user.roleRef && user.roleRef.permissions) {
    // Convert MongoDB Map to a plain JavaScript object if needed
    if (user.roleRef.permissions instanceof Map) {
      permissions = Object.fromEntries(user.roleRef.permissions);
    } else {
      permissions = user.roleRef.permissions;
    }
  } else {
    // Default permissions based on role
    if (user.role === 'university') {
      permissions = {
        view_courses: true,
        create_course: true,
        edit_course: true,
        delete_course: true,
        view_educators: true,
        create_educator: true,
        edit_educator: true,
        delete_educator: true,
        view_schools: true,
        view_blogs: true,
        view_quizzes: true,
        view_content: true,
      };
    } else if (user.role === 'educator') {
      permissions = {
        view_courses: true,
        view_blogs: true,
        view_quizzes: true,
        view_content: true,
      };
    } else if (user.role === 'admin' || user.role === 'staff') {
      // Admin and staff have all permissions
      permissions = { all: true };
    }
  }

  // Return updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        roleRef: user.roleRef ? {
          id: user.roleRef._id,
          name: user.roleRef.name,
        } : null,
        permissions,
        profile: user.profile,
        university: user.university,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});
