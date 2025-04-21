const User = require('../models/User');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Get all staff members
 * @route GET /api/admin/staff
 * @access Private (Admin only)
 */
exports.getStaffMembers = catchAsync(async (req, res, next) => {
  const staffMembers = await User.find({ role: 'admin' }).populate('roleRef');

  res.status(200).json({
    status: 'success',
    results: staffMembers.length,
    data: staffMembers
  });
});

/**
 * Get a staff member by ID
 * @route GET /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.getStaffMemberById = catchAsync(async (req, res, next) => {
  const staffMember = await User.findById(req.params.id).populate('roleRef');

  if (!staffMember || staffMember.role !== 'admin') {
    return next(new AppError('No staff member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: staffMember
  });
});

/**
 * Create a new staff member
 * @route POST /api/admin/staff
 * @access Private (Admin only)
 */
exports.createStaffMember = catchAsync(async (req, res, next) => {
  const { name, email, password, roleId, phoneNumber } = req.body;

  // Check if user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists', 400));
  }

  // Check if user with the same phone number already exists
  const existingPhoneUser = await User.findOne({ phoneNumber });
  if (existingPhoneUser) {
    return next(new AppError('A user with this phone number already exists', 400));
  }

  // Find the Super Admin role
  const Role = require('../models/Role');
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  if (!superAdminRole) {
    return next(new AppError('Super Admin role not found. Please run the seeder first.', 500));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new staff member
  const staffMember = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin', // Set role to admin for staff members
    phoneNumber: phoneNumber || '+919876543210', // Default phone number if not provided
    roleRef: superAdminRole._id, // Always assign Super Admin role
  });

  // Remove password from response
  staffMember.password = undefined;

  res.status(201).json({
    status: 'success',
    data: staffMember
  });
});

/**
 * Update a staff member
 * @route PUT /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.updateStaffMember = catchAsync(async (req, res, next) => {
  const { name, email, phoneNumber } = req.body;

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id);
  if (!staffMember || staffMember.role !== 'admin') {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Check if email is being changed and if it's already in use
  if (email && email !== staffMember.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }
  }

  // Check if phone number is being changed and if it's already in use
  if (phoneNumber && phoneNumber !== staffMember.phoneNumber) {
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return next(new AppError('A user with this phone number already exists', 400));
    }
  }

  // Find the Super Admin role
  const Role = require('../models/Role');
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  if (!superAdminRole) {
    return next(new AppError('Super Admin role not found. Please run the seeder first.', 500));
  }

  // Update staff member
  const updatedStaffMember = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: name || staffMember.name,
      email: email || staffMember.email,
      phoneNumber: phoneNumber || staffMember.phoneNumber,
      roleRef: superAdminRole._id // Always use Super Admin role
    },
    { new: true, runValidators: true }
  ).populate('roleRef');

  res.status(200).json({
    status: 'success',
    data: updatedStaffMember
  });
});

/**
 * Delete a staff member
 * @route DELETE /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.deleteStaffMember = catchAsync(async (req, res, next) => {
  // Check if staff member exists
  const staffMember = await User.findById(req.params.id);
  if (!staffMember || staffMember.role !== 'admin') {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Delete staff member
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Update staff member password
 * @route PUT /api/admin/staff/:id/password
 * @access Private (Admin only)
 */
exports.updateStaffMemberPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id);
  if (!staffMember || staffMember.role !== 'admin') {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password
  staffMember.password = hashedPassword;
  await staffMember.save();

  // Remove password from response
  staffMember.password = undefined;

  res.status(200).json({
    status: 'success',
    data: staffMember
  });
});
