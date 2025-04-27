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
  },

  // School Management Permissions
  SCHOOL_MANAGEMENT: {
    VIEW_SCHOOLS: 'view_schools',
    CREATE_SCHOOL: 'create_school',
    EDIT_SCHOOL: 'edit_school',
    DELETE_SCHOOL: 'delete_school',
  },

  // Educator Management Permissions
  EDUCATOR_MANAGEMENT: {
    VIEW_EDUCATORS: 'view_educators',
    CREATE_EDUCATOR: 'create_educator',
    EDIT_EDUCATOR: 'edit_educator',
    DELETE_EDUCATOR: 'delete_educator',
  }
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
