import { useState } from 'react';
import PermissionToggle from './PermissionToggle';

/**
 * Permission group component for grouping related permissions
 */
function PermissionGroup({ title, permissions, values, onChange, disabled = false }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if all permissions in the group are enabled
  const allEnabled = Object.keys(permissions).every(key => values[permissions[key]]);

  // Check if some permissions in the group are enabled
  const someEnabled = Object.keys(permissions).some(key => values[permissions[key]]);

  // Toggle all permissions in the group
  const toggleAll = () => {
    const newValue = !allEnabled;
    const updates = {};

    Object.keys(permissions).forEach(key => {
      const permissionKey = permissions[key];
      // Ensure view_courses is always true
      if (permissionKey === 'view_courses') {
        updates[permissionKey] = true;
      } else {
        updates[permissionKey] = newValue;
      }
    });

    onChange(updates);
  };

  // Handle individual permission toggle
  const handleToggle = (permission, value) => {
    onChange({ [permission]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* Group header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${allEnabled
            ? 'bg-green-100 text-green-800'
            : someEnabled
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
            }`}>
            {allEnabled
              ? 'All Enabled'
              : someEnabled
                ? 'Partially Enabled'
                : 'All Disabled'}
          </span>
        </div>

        <div className="flex items-center">
          {/* Toggle all button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAll();
            }}
            className={`mr-4 text-xs px-3 py-1 rounded ${allEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            {allEnabled ? 'Disable All' : 'Enable All'}
          </button>

          {/* Expand/collapse icon */}
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
              }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Group content */}
      {isExpanded && (
        <div className="p-4 divide-y divide-gray-100">
          {Object.keys(permissions).map(key => {
            const permissionKey = permissions[key];
            const isViewCourses = permissionKey === 'view_courses';

            return (
              <PermissionToggle
                key={permissionKey}
                permission={permissionKey}
                value={isViewCourses ? true : (values[permissionKey] || false)}
                onChange={handleToggle}
                disabled={disabled || isViewCourses}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PermissionGroup;
