import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from "./permissions";

/**
 * Get user data from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getUserFromLocalStorage = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

/**
 * Check if the current user has a specific permission using localStorage data
 * @param {String} permission - The permission to check
 * @returns {Boolean} - Whether the user has the permission
 */
export const hasLocalPermission = (permission) => {
  const user = getUserFromLocalStorage();
  if (!user) return false;

  // For debugging - log detailed user permission information
  console.debug(`Checking permission ${permission} for user:`, {
    role: user.role,
    roleRef: user.roleRef || "none",
    hasPermissionsObj: !!user.permissions,
    permissionValue: user.permissions
      ? user.permissions[permission]
      : "undefined",
    allPermissions: user.permissions || {},
  });

  const result = hasPermission(user, permission);
  console.debug(
    `Permission check result for ${permission}: ${
      result ? "Granted" : "Denied"
    }`
  );

  return result;
};

/**
 * Check if the current user has all of the specified permissions using localStorage data
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has all the permissions
 */
export const hasAllLocalPermissions = (permissions) => {
  const user = getUserFromLocalStorage();
  if (!user) return false;

  const result = hasAllPermissions(user, permissions);
  console.debug(
    `hasAllLocalPermissions check for [${permissions.join(", ")}]: ${
      result ? "Granted" : "Denied"
    }`
  );

  return result;
};

/**
 * Check if the current user has any of the specified permissions using localStorage data
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} - Whether the user has any of the permissions
 */
export const hasAnyLocalPermission = (permissions) => {
  const user = getUserFromLocalStorage();
  if (!user) return false;

  // Special case for admin and staff - they have all permissions
  if (user.role === "admin" || user.role === "staff") {
    console.debug(
      `hasAnyLocalPermission check for [${permissions.join(
        ", "
      )}]: Granted (admin/staff role)`
    );
    return true;
  }

  const result = hasAnyPermission(user, permissions);
  console.debug(
    `hasAnyLocalPermission check for [${permissions.join(", ")}]: ${
      result ? "Granted" : "Denied"
    }`
  );

  return result;
};
