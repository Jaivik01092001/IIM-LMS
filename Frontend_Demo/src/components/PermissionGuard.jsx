import { useSelector } from 'react-redux';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../utils/permissions';

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @param {Object} props
 * @param {String|Array} props.permission - Single permission or array of permissions to check
 * @param {Boolean} props.requireAll - If true, user must have all permissions in the array (default: false)
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission (optional)
 */
function PermissionGuard({ permission, requireAll = false, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);
  
  // If no permission is required, render children
  if (!permission) return children;
  
  // Check if user has the required permission(s)
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    // Check multiple permissions
    hasAccess = requireAll 
      ? hasAllPermissions(user, permission)
      : hasAnyPermission(user, permission);
  } else {
    // Check single permission
    hasAccess = hasPermission(user, permission);
  }
  
  // Render children if user has access, otherwise render fallback
  return hasAccess ? children : fallback;
}

export default PermissionGuard;
