import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/permissions';

/**
 * Component that conditionally renders children based on user role and/or permissions
 * 
 * @param {Object} props
 * @param {String|Array} props.roles - Single role or array of roles to check
 * @param {String|Array} props.permissions - Single permission or array of permissions to check
 * @param {Boolean} props.requireAll - If true, user must have all permissions in the array (default: false)
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission (optional)
 */
function ProtectedComponent({ roles, permissions, requireAll = false, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);
  
  // If no user, render fallback
  if (!user) return fallback;
  
  // Check role-based access
  let hasRoleAccess = true;
  if (roles) {
    if (Array.isArray(roles)) {
      hasRoleAccess = roles.includes(user.role);
    } else {
      hasRoleAccess = user.role === roles;
    }
  }
  
  // Check permission-based access
  let hasPermissionAccess = true;
  if (permissions) {
    if (Array.isArray(permissions)) {
      hasPermissionAccess = requireAll 
        ? permissions.every(permission => hasPermission(user, permission))
        : permissions.some(permission => hasPermission(user, permission));
    } else {
      hasPermissionAccess = hasPermission(user, permissions);
    }
  }
  
  // Render children if user has both role and permission access
  return (hasRoleAccess && hasPermissionAccess) ? children : fallback;
}

export default ProtectedComponent;
