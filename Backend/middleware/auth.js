const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/User');
const Role = require('../models/Role');
const catchAsync = require('../utils/catchAsync');

// Protect routes - Authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.header('x-auth-token')) {
    // For backward compatibility
    token = req.header('x-auth-token');
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findById(decoded.id).populate('roleRef');
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Check if user is inactive
  if (user.status === 0) {
    return next(new AppError('Your account is inactive. Please contact the administrator.', 403));
  }

  // 4) Grant access to protected route
  req.user = user;

  // Add user permissions to the request object for easy access
  req.userPermissions = user.roleRef ? user.roleRef.permissions : {};

  next();
});

// Role-based authorization middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Permission-based authorization middleware
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    // Always allow admin or staff users to access all routes
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      return next();
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Check if the user has the required permission
    if (!req.userPermissions[permission]) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

// Multiple permissions check middleware (requires ALL permissions)
exports.hasAllPermissions = (permissions) => {
  return (req, res, next) => {
    // Always allow admin or staff users to access all routes
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      return next();
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Check if the user has all the required permissions
    const hasAllRequired = permissions.every(permission => req.userPermissions[permission]);

    if (!hasAllRequired) {
      return next(new AppError('You do not have all required permissions to perform this action', 403));
    }

    next();
  };
};

// Multiple permissions check middleware (requires ANY of the permissions)
exports.hasAnyPermission = (permissions) => {
  return (req, res, next) => {
    // Always allow admin or staff users to access all routes
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      return next();
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Check if the user has any of the required permissions
    const hasAnyRequired = permissions.some(permission => req.userPermissions[permission]);

    if (!hasAnyRequired) {
      return next(new AppError('You do not have any of the required permissions to perform this action', 403));
    }

    next();
  };
};