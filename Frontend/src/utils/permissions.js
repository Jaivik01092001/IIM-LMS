/**
 * Utility functions for checking permissions in the frontend
 */

// Permission constants - must match backend permissions
export const PERMISSIONS = {
  // Course Management Permissions
  COURSE_MANAGEMENT: {
    VIEW_COURSES: "view_courses",
    CREATE_COURSE: "create_course",
    EDIT_COURSE: "edit_course",
    DELETE_COURSE: "delete_course",
    PUBLISH_COURSE: "publish_course",
    ENROLL_USERS: "enroll_users",
  },

  // Quiz Management Permissions
  QUIZ_MANAGEMENT: {
    VIEW_QUIZZES: "view_quizzes",
    CREATE_QUIZ: "create_quiz",
    EDIT_QUIZ: "edit_quiz",
    DELETE_QUIZ: "delete_quiz",
    VIEW_RESULTS: "view_quiz_results",
  },

  // User Management Permissions
  USER_MANAGEMENT: {
    VIEW_USERS: "view_users",
    CREATE_USER: "create_user",
    EDIT_USER: "edit_user",
    DELETE_USER: "delete_user",
    ASSIGN_ROLES: "assign_roles",
  },

  // Content Management Permissions
  CONTENT_MANAGEMENT: {
    VIEW_CONTENT: "view_content",
    CREATE_CONTENT: "create_content",
    EDIT_CONTENT: "edit_content",
    DELETE_CONTENT: "delete_content",
    APPROVE_CONTENT: "approve_content",
  },

  // Certificate Management Permissions
  CERTIFICATE_MANAGEMENT: {
    VIEW_CERTIFICATES: "view_certificates",
    CREATE_CERTIFICATE: "create_certificate",
    EDIT_CERTIFICATE: "edit_certificate",
    DELETE_CERTIFICATE: "delete_certificate",
    ISSUE_CERTIFICATE: "issue_certificate",
  },

  // Reports & Analytics Permissions
  REPORTS_ANALYTICS: {
    VIEW_REPORTS: "view_reports",
    EXPORT_REPORTS: "export_reports",
    VIEW_ANALYTICS: "view_analytics",
  },

  // Blog Management Permissions
  BLOG_MANAGEMENT: {
    VIEW_BLOGS: "view_blogs",
    CREATE_BLOG: "create_blog",
    EDIT_BLOG: "edit_blog",
    DELETE_BLOG: "delete_blog",
  },

  // School Management Permissions
  SCHOOL_MANAGEMENT: {
    VIEW_SCHOOLS: "view_schools",
    CREATE_SCHOOL: "create_school",
    EDIT_SCHOOL: "edit_school",
    DELETE_SCHOOL: "delete_school",
  },

  // Educator Management Permissions
  EDUCATOR_MANAGEMENT: {
    VIEW_EDUCATORS: "view_educators",
    CREATE_EDUCATOR: "create_educator",
    EDIT_EDUCATOR: "edit_educator",
    DELETE_EDUCATOR: "delete_educator",
  },

  // System Settings Permissions
  SYSTEM_SETTINGS: {
    VIEW_SETTINGS: "view_settings",
    EDIT_SETTINGS: "edit_settings",
    MANAGE_ROLES: "manage_roles",
  },
};

/**
 * Check if the user has a specific permission
 * @param {Object} user - The user object from Redux state
 * @param {String} permission - The permission to check
 * @returns {Boolean} - Whether the user has the permission
 */
export const hasPermission = (user, permission) => {
  // If no user or no permission, return false
  if (!user) return false;

  // Super Admin and IIM Staff roles have all permissions
  if (user.role === "admin" || user.role === "staff") return true;

  // IMPORTANT: If permissions is explicitly null, the user has no permissions
  if (user.permissions === null) {
    return false;
  }

  // Check if the user has explicit permissions object
  // This handles the case where permissions are directly assigned via roleRef
  if (user.permissions && typeof user.permissions === "object") {
    // Important: Only return true if the permission is explicitly set to true
    // Otherwise, return false (permission not granted)
    return user.permissions[permission] === true;
  }

  // If no permissions object, return false
  // This ensures users can only perform actions explicitly set to true in their roleRef
  return false;
};

/**
 * Check if the user has all of the specified permissions
 * @param {Object} user - The user object from Redux state
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has all the permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Check if the user has any of the specified permissions
 * @param {Object} user - The user object from Redux state
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Format permission name for display
 * @param {String} permissionName - The permission name
 * @returns {String} - Formatted permission name
 */
export const formatPermissionName = (permissionName) => {
  return permissionName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
