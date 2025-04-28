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
  // Find the IIM Staff role
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  // Find all users with the IIM Staff role or Super Admin role
  const staffMembers = await User.find({
    $or: [
      { roleRef: staffRole ? staffRole._id : null },
      { roleRef: superAdminRole ? superAdminRole._id : null }
    ]
  }).populate('roleRef');

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
  // Find the IIM Staff and Super Admin roles
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  const staffMember = await User.findById(req.params.id).populate('roleRef');

  // Check if the user exists and has either the IIM Staff or Super Admin role
  if (!staffMember || (staffMember.roleRef &&
      staffMember.roleRef.toString() !== (staffRole?._id?.toString() || '') &&
      staffMember.roleRef.toString() !== (superAdminRole?._id?.toString() || ''))) {
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
  const { name, email, password, phoneNumber } = req.body;

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

  // Find the IIM Staff role
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });

  if (!staffRole) {
    return next(new AppError('IIM Staff role not found. Please run the seeder first.', 500));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new staff member
  const staffMember = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'staff', // Use 'staff' as the role name
    phoneNumber, // No default phone number, must be provided by user
    roleRef: staffRole._id, // Assign IIM Staff role
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

  // Find the IIM Staff and Super Admin roles
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id).populate('roleRef');

  // Check if the user exists and has either the IIM Staff or Super Admin role
  if (!staffMember || (staffMember.roleRef &&
      staffMember.roleRef.toString() !== (staffRole?._id?.toString() || '') &&
      staffMember.roleRef.toString() !== (superAdminRole?._id?.toString() || ''))) {
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

  if (!staffRole) {
    return next(new AppError('IIM Staff role not found. Please run the seeder first.', 500));
  }

  // Update staff member
  const updatedStaffMember = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: name || staffMember.name,
      email: email || staffMember.email,
      phoneNumber: phoneNumber || staffMember.phoneNumber,
      role: 'staff', // Use 'staff' as the role name
      roleRef: staffRole._id // Use IIM Staff role
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
  // Find the IIM Staff and Super Admin roles
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id).populate('roleRef');

  // Check if the user exists and has either the IIM Staff or Super Admin role
  if (!staffMember || (staffMember.roleRef &&
      staffMember.roleRef.toString() !== (staffRole?._id?.toString() || '') &&
      staffMember.roleRef.toString() !== (superAdminRole?._id?.toString() || ''))) {
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

  // Find the IIM Staff and Super Admin roles
  const Role = require('../models/Role');
  const staffRole = await Role.findOne({ name: 'IIM Staff' });
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id).populate('roleRef');

  // Check if the user exists and has either the IIM Staff or Super Admin role
  if (!staffMember || (staffMember.roleRef &&
      staffMember.roleRef.toString() !== (staffRole?._id?.toString() || '') &&
      staffMember.roleRef.toString() !== (superAdminRole?._id?.toString() || ''))) {
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
