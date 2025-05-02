import React from 'react';
import PropTypes from 'prop-types';
import { hasPermission } from '../../utils/permissions';
import '../../assets/styles/StatusToggle.css';

/**
 * StatusToggle component that conditionally allows toggling based on user permissions
 *
 * @param {Object} props
 * @param {Boolean|String} props.status - Current status (boolean or 'published'/'draft')
 * @param {Function} props.onToggle - Function to call when status is toggled
 * @param {String} props.permission - Permission required to toggle status (usually delete permission)
 * @param {String} props.activeText - Text to display when status is active/published
 * @param {String} props.inactiveText - Text to display when status is inactive/draft
 * @param {String} props.activeTooltip - Tooltip text when status is active/published
 * @param {String} props.inactiveTooltip - Tooltip text when status is inactive/draft
 */
const StatusToggle = ({
  status,
  onToggle,
  permission,
  activeText = 'Active',
  inactiveText = 'Inactive',
  activeTooltip = 'Click to deactivate',
  inactiveTooltip = 'Click to activate'
}) => {
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

  // Determine if status is active based on input type
  const isActive = typeof status === 'string'
    ? status === 'published'
    : Boolean(status);

  // Check if user has permission to toggle
  const canToggle = user && hasPermission(user, permission);

  return (
    <div className={`status-cell ${!canToggle ? 'status-cell-no-toggle' : ''}`}>
      {/* Only show the toggle indicator if user has permission */}
      {canToggle && (
        <div
          className={`status-indicator ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          title={isActive ? activeTooltip : inactiveTooltip}
          style={{ cursor: 'pointer' }}
        />
      )}
      <span className={isActive ? 'text-green-600' : 'text-red-600'}>
        {isActive ? activeText : inactiveText}
      </span>
    </div>
  );
};

StatusToggle.propTypes = {
  status: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]).isRequired,
  onToggle: PropTypes.func.isRequired,
  permission: PropTypes.string.isRequired,
  activeText: PropTypes.string,
  inactiveText: PropTypes.string,
  activeTooltip: PropTypes.string,
  inactiveTooltip: PropTypes.string
};

export default StatusToggle;
