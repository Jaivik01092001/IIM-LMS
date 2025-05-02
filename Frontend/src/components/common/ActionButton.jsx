import React from 'react';
import PropTypes from 'prop-types';
import { hasPermission } from '../../utils/permissions';

/**
 * ActionButton component that conditionally renders based on user permissions
 *
 * @param {Object} props
 * @param {String} props.type - Button type (view, edit, delete)
 * @param {Function} props.onClick - Click handler function
 * @param {String} props.permission - Permission required to show this button
 * @param {React.ReactNode} props.icon - Icon to display in the button
 * @param {String} props.title - Button tooltip text
 * @param {String} props.className - Additional CSS classes
 */
const ActionButton = ({ type, onClick, permission, icon, title, className }) => {
  // Get user from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  const user = getUserFromLocalStorage();

  // If no permission is required, render the button
  if (!permission) {
    return (
      <button
        className={`action-button ${type} ${className || ''}`}
        onClick={onClick}
        title={title}
      >
        {icon}
      </button>
    );
  }

  // If user exists, check permission
  if (user) {
    // For debugging - log detailed permission information
    const hasAccess = hasPermission(user, permission);
    console.debug(`Permission check for ${permission}:`, {
      result: hasAccess ? 'Granted' : 'Denied',
      buttonType: type,
      userRole: user.role,
      roleRef: user.roleRef || 'none',
      hasPermissionsObj: !!user.permissions,
      permissionValue: user.permissions ? user.permissions[permission] : 'undefined'
    });

    if (hasAccess) {
      return (
        <button
          className={`action-button ${type} ${className || ''}`}
          onClick={onClick}
          title={title}
        >
          {icon}
        </button>
      );
    }
  }

  // Otherwise, don't render anything
  return null;
};

ActionButton.propTypes = {
  type: PropTypes.oneOf(['view', 'edit', 'delete', 'add']).isRequired,
  onClick: PropTypes.func.isRequired,
  permission: PropTypes.string,
  icon: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default ActionButton;
