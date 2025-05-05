const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/User");
const Role = require("../models/Role");
const catchAsync = require("../utils/catchAsync");

// Protect routes - Authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.header("x-auth-token")) {
    // For backward compatibility
    token = req.header("x-auth-token");
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401)
    );
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findById(decoded.id).populate("roleRef");
  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Check if user is inactive
  if (user.status === 0) {
    return next(
      new AppError(
        "Your account is inactive. Please contact the administrator.",
        403
      )
    );
  }

  // 4) Grant access to protected route
  req.user = user;

  // Add user permissions to the request object for easy access
  if (user.roleRef && user.roleRef.permissions) {
    // Convert MongoDB Map to a plain JavaScript object if needed
    if (user.roleRef.permissions instanceof Map) {
      req.userPermissions = Object.fromEntries(user.roleRef.permissions);
    } else if (
      typeof user.roleRef.permissions === "object" &&
      user.roleRef.permissions !== null
    ) {
      // If it's already an object (e.g., from JSON), use it directly
      req.userPermissions = user.roleRef.permissions;
    } else {
      // Fallback to empty object if permissions is not in expected format
      req.userPermissions = {};
    }
  } else {
    // If roleRef is not populated or permissions are not set, initialize an empty object
    req.userPermissions = {};

    // For university users without roleRef, add default permissions
    if (user.role === "university") {
      req.userPermissions = {
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
    }

    // For educator users without roleRef, add default permissions
    if (user.role === "educator") {
      req.userPermissions = {
        view_courses: true,
        view_blogs: true,
        view_quizzes: true,
        view_content: true,
      };
    }
  }

  next();
});

// Role-based authorization middleware
exports.restrictTo = (...roles) => {
  return (req, _res, next) => {
    // Map UI role names to DB role values if needed
    const mappedRoles = roles.map((role) => {
      // No mapping needed as we're already using DB role values in the code
      return role;
    });

    if (!mappedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// Permission-based authorization middleware
exports.hasPermission = (permission) => {
  return (req, _res, next) => {
    // Always allow admin (Super Admin) or staff (IIM Staff) users to access all routes
    if (req.user.role === "admin" || req.user.role === "staff") {
      return next();
    }

    // Special handling for educator role with default permissions
    if (req.user.role === "educator" && !req.user.roleRef) {
      // Default permissions for educators if roleRef is not set
      const educatorDefaultPermissions = [
        "view_courses",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      if (educatorDefaultPermissions.includes(permission)) {
        return next();
      }
    }

    // Special handling for university role with default permissions
    if (req.user.role === "university" && !req.user.roleRef) {
      // Default permissions for universities if roleRef is not set
      const universityDefaultPermissions = [
        "view_courses",
        "create_course",
        "edit_course",
        "delete_course",
        "view_educators",
        "create_educator",
        "edit_educator",
        "delete_educator",
        "view_schools",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      if (universityDefaultPermissions.includes(permission)) {
        return next();
      }
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    // Check if the user has the required permission
    // First, log the permission being checked and the user's permissions for debugging
    console.log(`Checking permission: ${permission}`);
    console.log(`User permissions:`, req.userPermissions);

    // Check if the permission exists and is set to true
    if (!req.userPermissions[permission]) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

// Multiple permissions check middleware (requires ALL permissions)
exports.hasAllPermissions = (permissions) => {
  return (req, _res, next) => {
    // Always allow admin (Super Admin) or staff (IIM Staff) users to access all routes
    if (req.user.role === "admin" || req.user.role === "staff") {
      return next();
    }

    // Special handling for educator role with default permissions
    if (req.user.role === "educator" && !req.user.roleRef) {
      // Default permissions for educators if roleRef is not set
      const educatorDefaultPermissions = [
        "view_courses",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      // Check if all required permissions are in the educator default permissions
      const hasAllDefaultPermissions = permissions.every((permission) =>
        educatorDefaultPermissions.includes(permission)
      );

      if (hasAllDefaultPermissions) {
        return next();
      }
    }

    // Special handling for university role with default permissions
    if (req.user.role === "university" && !req.user.roleRef) {
      // Default permissions for universities if roleRef is not set
      const universityDefaultPermissions = [
        "view_courses",
        "create_course",
        "edit_course",
        "delete_course",
        "view_educators",
        "create_educator",
        "edit_educator",
        "delete_educator",
        "view_schools",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      // Check if all required permissions are in the university default permissions
      const hasAllDefaultPermissions = permissions.every((permission) =>
        universityDefaultPermissions.includes(permission)
      );

      if (hasAllDefaultPermissions) {
        return next();
      }
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    // Log permissions being checked for debugging
    console.log(`Checking all permissions:`, permissions);
    console.log(`User permissions:`, req.userPermissions);

    // Check if the user has all the required permissions
    const hasAllRequired = permissions.every(
      (permission) => req.userPermissions[permission] === true
    );

    if (!hasAllRequired) {
      return next(
        new AppError(
          "You do not have all required permissions to perform this action",
          403
        )
      );
    }

    next();
  };
};

// Multiple permissions check middleware (requires ANY of the permissions)
exports.hasAnyPermission = (permissions) => {
  return (req, _res, next) => {
    // Always allow admin (Super Admin) or staff (IIM Staff) users to access all routes
    if (req.user.role === "admin" || req.user.role === "staff") {
      return next();
    }

    // Special handling for educator role with default permissions
    if (req.user.role === "educator" && !req.user.roleRef) {
      // Default permissions for educators if roleRef is not set
      const educatorDefaultPermissions = [
        "view_courses",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      // Check if any of the required permissions are in the educator default permissions
      const hasAnyDefaultPermission = permissions.some((permission) =>
        educatorDefaultPermissions.includes(permission)
      );

      if (hasAnyDefaultPermission) {
        return next();
      }
    }

    // Special handling for university role with default permissions
    if (req.user.role === "university" && !req.user.roleRef) {
      // Default permissions for universities if roleRef is not set
      const universityDefaultPermissions = [
        "view_courses",
        "create_course",
        "edit_course",
        "delete_course",
        "view_educators",
        "create_educator",
        "edit_educator",
        "delete_educator",
        "view_schools",
        "view_blogs",
        "view_quizzes",
        "view_content",
      ];

      // Check if any of the required permissions are in the university default permissions
      const hasAnyDefaultPermission = permissions.some((permission) =>
        universityDefaultPermissions.includes(permission)
      );

      if (hasAnyDefaultPermission) {
        return next();
      }
    }

    // If no permissions are set up yet, deny access
    if (!req.userPermissions) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    // Log permissions being checked for debugging
    console.log(`Checking any permissions:`, permissions);
    console.log(`User permissions:`, req.userPermissions);

    // Check if the user has any of the required permissions
    const hasAnyRequired = permissions.some(
      (permission) => req.userPermissions[permission] === true
    );

    if (!hasAnyRequired) {
      return next(
        new AppError(
          "You do not have any of the required permissions to perform this action",
          403
        )
      );
    }

    next();
  };
};
