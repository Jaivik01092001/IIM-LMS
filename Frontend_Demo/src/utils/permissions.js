/**
 * Utility functions for checking permissions in the frontend
 */

// Permission constants - must match backend permissions
export const PERMISSIONS = {
  // Course Management Permissions
  COURSE_MANAGEMENT: {
    VIEW_COURSES: 'view_courses',
    CREATE_COURSE: 'create_course',
    EDIT_COURSE: 'edit_course',
    DELETE_COURSE: 'delete_course',
    PUBLISH_COURSE: 'publish_course',
    ENROLL_USERS: 'enroll_users',
  },

  // Quiz Management Permissions
  QUIZ_MANAGEMENT: {
    VIEW_QUIZZES: 'view_quizzes',
    CREATE_QUIZ: 'create_quiz',
    EDIT_QUIZ: 'edit_quiz',
    DELETE_QUIZ: 'delete_quiz',
    VIEW_RESULTS: 'view_quiz_results',
  },

  // User Management Permissions
  USER_MANAGEMENT: {
    VIEW_USERS: 'view_users',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    ASSIGN_ROLES: 'assign_roles',
  },

  // Content Management Permissions
  CONTENT_MANAGEMENT: {
    VIEW_CONTENT: 'view_content',
    CREATE_CONTENT: 'create_content',
    EDIT_CONTENT: 'edit_content',
    DELETE_CONTENT: 'delete_content',
    APPROVE_CONTENT: 'approve_content',
  },

  // Certificate Management Permissions
  CERTIFICATE_MANAGEMENT: {
    VIEW_CERTIFICATES: 'view_certificates',
    CREATE_CERTIFICATE: 'create_certificate',
    EDIT_CERTIFICATE: 'edit_certificate',
    DELETE_CERTIFICATE: 'delete_certificate',
    ISSUE_CERTIFICATE: 'issue_certificate',
  },

  // Reports & Analytics Permissions
  REPORTS_ANALYTICS: {
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    VIEW_ANALYTICS: 'view_analytics',
  },

  // System Settings Permissions
  SYSTEM_SETTINGS: {
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings',
    MANAGE_ROLES: 'manage_roles',
  },
};

/**
 * Check if the user has a specific permission
 * @param {Object} user - The user object from Redux state
 * @param {String} permission - The permission to check
 * @returns {Boolean} - Whether the user has the permission
 */
export const hasPermission = (user, permission) => {
  // Debug logging
  console.log('hasPermission check:', {
    user: user ? {
      id: user.id,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      roleRef: user.roleRef
    } : null,
    permission,
    permissionsType: user ? typeof user.permissions : 'no user',
    permissionsIsNull: user ? user.permissions === null : 'no user'
  });

  // If no user or no permission, return false
  if (!user) return false;

  // For backward compatibility, admin role has all permissions
  if (user.role === 'admin') return true;

  // IMPORTANT: If permissions is explicitly null, the user has no permissions
  if (user.permissions === null) {
    console.log('User permissions is explicitly null, returning false');
    return false;
  }

  // If user has no roleRef or permissions is undefined, check based on role
  if (!user.roleRef || user.permissions === undefined) {
    // Default permissions based on role for backward compatibility
    switch (user.role) {
      case 'admin':
        return true;
      case 'university':
        return [
          PERMISSIONS.USER_MANAGEMENT.VIEW_USERS,
          PERMISSIONS.USER_MANAGEMENT.CREATE_USER,
          PERMISSIONS.USER_MANAGEMENT.EDIT_USER,
          PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES,
          PERMISSIONS.CONTENT_MANAGEMENT.VIEW_CONTENT,
        ].includes(permission);
      case 'educator':
        return [
          PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES,
          PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE,
          PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE,
          PERMISSIONS.QUIZ_MANAGEMENT.VIEW_QUIZZES,
          PERMISSIONS.QUIZ_MANAGEMENT.CREATE_QUIZ,
          PERMISSIONS.QUIZ_MANAGEMENT.EDIT_QUIZ,
          PERMISSIONS.CONTENT_MANAGEMENT.VIEW_CONTENT,
          PERMISSIONS.CONTENT_MANAGEMENT.CREATE_CONTENT,
          PERMISSIONS.CONTENT_MANAGEMENT.EDIT_CONTENT,
        ].includes(permission);
      default:
        return false;
    }
  }

  // Check if the permission is granted in the user's permissions object
  const hasPermissionResult = user.permissions && user.permissions[permission] === true;
  console.log('Permission check result:', { permission, result: hasPermissionResult });
  return hasPermissionResult;
};

/**
 * Check if the user has all of the specified permissions
 * @param {Object} user - The user object from Redux state
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has all the permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if the user has any of the specified permissions
 * @param {Object} user - The user object from Redux state
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Format permission name for display
 * @param {String} permissionName - The permission name
 * @returns {String} - Formatted permission name
 */
export const formatPermissionName = (permissionName) => {
  return permissionName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
