const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

/**
 * Get all staff members
 * @route GET /api/admin/staff
 * @access Private (Admin only)
 */
exports.getStaffMembers = catchAsync(async (req, res, next) => {
  // Find the IIM Staff role
  const Role = require("../models/Role");
  const staffRole = await Role.findOne({ name: "IIM Staff" });

  // Find all users with the IIM Staff role (role="staff") or with the IIM Staff roleRef
  // Exclude users with role="admin" (Super Admin)
  const staffMembers = await User.find({
    $or: [{ role: "staff" }, { roleRef: staffRole ? staffRole._id : null }],
    role: { $ne: "admin" }, // Exclude users with role="admin"
  }).populate("roleRef");

  res.status(200).json({
    status: "success",
    results: staffMembers.length,
    data: staffMembers,
  });
});

/**
 * Get a staff member by ID
 * @route GET /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.getStaffMemberById = catchAsync(async (req, res, next) => {
  // Find the IIM Staff role
  const Role = require("../models/Role");
  const staffRole = await Role.findOne({ name: "IIM Staff" });

  // Find staff member
  const staffMember = await User.findById(req.params.id).populate("roleRef");

  // Check if the user exists
  if (!staffMember) {
    return next(new AppError("No staff member found with that ID", 404));
  }

  // Check if the user has a staff-related role
  // Only accept 'staff' role or IIM Staff roleRef, exclude admin role
  const isStaffRole =
    staffMember.role === "staff" ||
    (staffMember.roleRef &&
      staffMember.roleRef.toString() === (staffRole?._id?.toString() || ""));

  // Exclude users with admin role
  if (!isStaffRole || staffMember.role === "admin") {
    return next(new AppError("No staff member found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: staffMember,
  });
});

/**
 * Create a new staff member
 * @route POST /api/admin/staff
 * @access Private (Admin only)
 */
exports.createStaffMember = catchAsync(async (req, res, next) => {
  // Log the request body for debugging
  console.log("Request body received:", req.body);
  console.log("Request file:", req.file);

  // Extract form data
  const { name, email, phoneNumber } = req.body;

  // Verify required fields
  if (!name || !email || !phoneNumber) {
    console.log(
      "Missing required fields. Name:",
      name,
      "Email:",
      email,
      "Phone:",
      phoneNumber
    );
    return next(
      new AppError("Name, email, and phone number are required fields", 400)
    );
  }

  // Check if user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("A user with this email already exists", 400));
  }

  // Check if user with the same phone number already exists
  const existingPhoneUser = await User.findOne({ phoneNumber });
  if (existingPhoneUser) {
    return next(
      new AppError("A user with this phone number already exists", 400)
    );
  }

  // Find the IIM Staff role
  const Role = require("../models/Role");
  const staffRole = await Role.findOne({ name: "IIM Staff" });

  if (!staffRole) {
    return next(
      new AppError(
        "IIM Staff role not found. Please run the seeder first.",
        500
      )
    );
  }

  // Prepare staff member data
  const staffData = {
    name,
    email,
    phoneNumber,
    role: "staff", // Fixed core role value for staff
    roleRef: staffRole._id, // Assign IIM Staff role for permissions
    status: req.body.status || 1, // Default to active
  };

  // Prepare profile data
  const profileData = {};

  // Get profile fields from form data - check both formats (with dot notation and without)
  if (req.body["profile.designation"] || req.body.designation)
    profileData.designation =
      req.body["profile.designation"] || req.body.designation;

  if (req.body["profile.department"] || req.body.department)
    profileData.department =
      req.body["profile.department"] || req.body.department;

  if (req.body["profile.address"] || req.body.address)
    profileData.address = req.body["profile.address"] || req.body.address;

  if (req.body["profile.state"] || req.body.state)
    profileData.state = req.body["profile.state"] || req.body.state;

  if (req.body["profile.zipcode"] || req.body.zipcode)
    profileData.zipcode = req.body["profile.zipcode"] || req.body.zipcode;

  // Add profile data if we have any fields
  if (Object.keys(profileData).length > 0) {
    staffData.profile = profileData;
  }

  // Handle avatar if uploaded
  if (req.file) {
    staffData.profile = staffData.profile || {};
    staffData.profile.avatar = `uploads/${req.file.filename}`;
  }

  console.log(
    "Creating staff member with data:",
    JSON.stringify(staffData, null, 2)
  );

  // Create new staff member
  const staffMember = await User.create(staffData);

  res.status(201).json({
    status: "success",
    data: staffMember,
  });
});

/**
 * Update a staff member
 * @route PUT /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.updateStaffMember = catchAsync(async (req, res, next) => {
  // Log the request body for debugging
  console.log("Update request body received:", req.body);
  console.log("Update request file:", req.file);

  const { name, email, phoneNumber } = req.body;

  // Find the IIM Staff role
  const Role = require("../models/Role");
  const staffRole = await Role.findOne({ name: "IIM Staff" });

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id).populate("roleRef");

  // Check if the user exists
  if (!staffMember) {
    return next(new AppError("No staff member found with that ID", 404));
  }

  // Check if the user has a staff-related role
  // Only accept 'staff' role or IIM Staff roleRef, exclude admin role
  const isStaffRole =
    staffMember.role === "staff" ||
    (staffMember.roleRef &&
      staffMember.roleRef.toString() === (staffRole?._id?.toString() || ""));

  // Exclude users with admin role
  if (!isStaffRole || staffMember.role === "admin") {
    return next(new AppError("No staff member found with that ID", 404));
  }

  // Check if email is being changed and if it's already in use
  if (email && email !== staffMember.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("A user with this email already exists", 400));
    }
  }

  // Check if phone number is being changed and if it's already in use
  if (phoneNumber && phoneNumber !== staffMember.phoneNumber) {
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return next(
        new AppError("A user with this phone number already exists", 400)
      );
    }
  }

  if (!staffRole) {
    return next(
      new AppError(
        "IIM Staff role not found. Please run the seeder first.",
        500
      )
    );
  }

  // Prepare update data
  const updateData = {
    name: name || staffMember.name,
    email: email || staffMember.email,
    phoneNumber: phoneNumber || staffMember.phoneNumber,
    // Keep the existing role value, don't update it
    roleRef: staffRole._id, // Use IIM Staff role
    status: req.body.status || staffMember.status,
  };

  // Prepare profile data
  const profileData = staffMember.profile || {};

  // Update profile fields if they exist in the request (check both formats)
  if (req.body["profile.designation"] || req.body.designation) {
    profileData.designation =
      req.body["profile.designation"] || req.body.designation;
    console.log("Setting designation to:", profileData.designation);
  }

  if (req.body["profile.department"] || req.body.department) {
    profileData.department =
      req.body["profile.department"] || req.body.department;
    console.log("Setting department to:", profileData.department);
  }

  if (req.body["profile.address"] || req.body.address)
    profileData.address = req.body["profile.address"] || req.body.address;

  if (req.body["profile.state"] || req.body.state)
    profileData.state = req.body["profile.state"] || req.body.state;

  if (req.body["profile.zipcode"] || req.body.zipcode)
    profileData.zipcode = req.body["profile.zipcode"] || req.body.zipcode;

  // Add profile data to update (make sure it's properly set as a full object)
  updateData.profile = profileData;

  // Handle avatar if uploaded
  if (req.file) {
    updateData.profile.avatar = `uploads/${req.file.filename}`;
  }

  console.log(
    "Updating staff member with data:",
    JSON.stringify(updateData, null, 2)
  );

  // Update staff member
  const updatedStaffMember = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate("roleRef");

  console.log(
    "Updated staff member:",
    JSON.stringify(updatedStaffMember, null, 2)
  );

  res.status(200).json({
    status: "success",
    data: updatedStaffMember,
  });
});

/**
 * Delete a staff member
 * @route DELETE /api/admin/staff/:id
 * @access Private (Admin only)
 */
exports.deleteStaffMember = catchAsync(async (req, res, next) => {
  // Find the IIM Staff role
  const Role = require("../models/Role");
  const staffRole = await Role.findOne({ name: "IIM Staff" });

  // Check if staff member exists
  const staffMember = await User.findById(req.params.id).populate("roleRef");

  // Check if the user exists
  if (!staffMember) {
    return next(new AppError("No staff member found with that ID", 404));
  }

  // Check if the user has a staff-related role
  // Only accept 'staff' role or IIM Staff roleRef, exclude admin role
  const isStaffRole =
    staffMember.role === "staff" ||
    (staffMember.roleRef &&
      staffMember.roleRef.toString() === (staffRole?._id?.toString() || ""));

  // Exclude users with admin role
  if (!isStaffRole || staffMember.role === "admin") {
    return next(new AppError("No staff member found with that ID", 404));
  }

  // Soft delete - set status to 0 (inactive) instead of hard deleting
  staffMember.status = 0;
  await staffMember.save();

  res.status(200).json({
    status: "success",
    message: "Staff member deleted successfully",
  });
});
