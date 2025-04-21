/**
 * This file defines all the permissions available in the system.
 * Permissions are grouped by category for better organization.
 */

const PERMISSIONS = {
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

// Create a flat array of all permissions for seeding the database
const getAllPermissions = () => {
  const permissionsList = [];
  
  Object.keys(PERMISSIONS).forEach(category => {
    Object.keys(PERMISSIONS[category]).forEach(permission => {
      permissionsList.push({
        name: PERMISSIONS[category][permission],
        description: formatPermissionName(PERMISSIONS[category][permission]),
        category: category.toLowerCase()
      });
    });
  });
  
  return permissionsList;
};

// Helper function to format permission names for display
const formatPermissionName = (permissionName) => {
  return permissionName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get permissions by category
const getPermissionsByCategory = () => {
  const permissionsByCategory = {};
  
  Object.keys(PERMISSIONS).forEach(category => {
    permissionsByCategory[category.toLowerCase()] = Object.values(PERMISSIONS[category]);
  });
  
  return permissionsByCategory;
};

module.exports = {
  PERMISSIONS,
  getAllPermissions,
  getPermissionsByCategory,
  formatPermissionName
};
