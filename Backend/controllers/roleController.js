const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getPermissionsByCategory } = require('../utils/permissions');

/**
 * Get all roles
 * @route GET /api/roles
 * @access Private (Admin only)
 */
exports.getAllRoles = catchAsync(async (req, res, next) => {
  const roles = await Role.find();
  
  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles
    }
  });
});

/**
 * Get a single role by ID
 * @route GET /api/roles/:id
 * @access Private (Admin only)
 */
exports.getRoleById = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      role
    }
  });
});

/**
 * Create a new role
 * @route POST /api/roles
 * @access Private (Admin only)
 */
exports.createRole = catchAsync(async (req, res, next) => {
  const { name, description, permissions } = req.body;
  
  // Check if role with the same name already exists
  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    return next(new AppError('A role with this name already exists', 400));
  }
  
  // Create new role
  const role = await Role.create({
    name,
    description,
    permissions: permissions || {},
    createdBy: req.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      role
    }
  });
});

/**
 * Update a role
 * @route PUT /api/roles/:id
 * @access Private (Admin only)
 */
exports.updateRole = catchAsync(async (req, res, next) => {
  const { name, description, permissions } = req.body;
  
  // Check if role exists
  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  // Check if new name conflicts with existing role
  if (name && name !== role.name) {
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return next(new AppError('A role with this name already exists', 400));
    }
  }
  
  // Update role
  const updatedRole = await Role.findByIdAndUpdate(
    req.params.id,
    {
      name: name || role.name,
      description: description || role.description,
      permissions: permissions || role.permissions
    },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      role: updatedRole
    }
  });
});

/**
 * Delete a role
 * @route DELETE /api/roles/:id
 * @access Private (Admin only)
 */
exports.deleteRole = catchAsync(async (req, res, next) => {
  // Check if role exists
  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  // Check if role is assigned to any users
  const usersWithRole = await User.countDocuments({ roleRef: req.params.id });
  if (usersWithRole > 0) {
    return next(new AppError('Cannot delete a role that is assigned to users', 400));
  }
  
  // Delete role
  await Role.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get all permissions
 * @route GET /api/permissions
 * @access Private (Admin only)
 */
exports.getAllPermissions = catchAsync(async (req, res, next) => {
  const permissions = await Permission.find();
  
  res.status(200).json({
    status: 'success',
    results: permissions.length,
    data: {
      permissions
    }
  });
});

/**
 * Get permissions grouped by category
 * @route GET /api/permissions/categories
 * @access Private (Admin only)
 */
exports.getPermissionsByCategory = catchAsync(async (req, res, next) => {
  const permissions = await Permission.find();
  
  // Group permissions by category
  const permissionsByCategory = {};
  permissions.forEach(permission => {
    if (!permissionsByCategory[permission.category]) {
      permissionsByCategory[permission.category] = [];
    }
    permissionsByCategory[permission.category].push(permission);
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      categories: permissionsByCategory
    }
  });
});

/**
 * Assign a role to a user
 * @route POST /api/users/:userId/role
 * @access Private (Admin only)
 */
exports.assignRoleToUser = catchAsync(async (req, res, next) => {
  const { roleId } = req.body;
  
  // Check if user exists
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  // Assign role to user
  user.roleRef = roleId;
  await user.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleRef: user.roleRef
      }
    }
  });
});
