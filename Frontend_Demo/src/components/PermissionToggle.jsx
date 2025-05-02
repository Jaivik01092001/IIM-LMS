import { useState, useEffect } from 'react';
import { formatPermissionName } from '../utils/permissions';

/**
 * Toggle switch component for permissions
 */
function PermissionToggle({ permission, value, onChange, disabled = false }) {
  // Always set view_courses to true and make it non-editable
  const isViewCourses = permission === 'view_courses';
  const [isChecked, setIsChecked] = useState(isViewCourses ? true : (value || false));

  // Update local state when value prop changes, but always keep view_courses as true
  useEffect(() => {
    setIsChecked(isViewCourses ? true : (value || false));
  }, [value, isViewCourses]);

  // Handle toggle change - prevent changing view_courses
  const handleChange = () => {
    // If this is view_courses permission, don't allow changes
    if (isViewCourses) return;

    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(permission, newValue);
  };

  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 ${isViewCourses ? 'bg-blue-50 px-2 rounded' : ''}`}>
      <label htmlFor={`toggle-${permission}`} className="text-sm font-medium text-gray-700 cursor-pointer">
        {formatPermissionName(permission)}
        {isViewCourses && (
          <span className="ml-1 text-xs text-blue-600 font-medium italic">(Always enabled)</span>
        )}
      </label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none">
        <input
          type="checkbox"
          id={`toggle-${permission}`}
          name={`toggle-${permission}`}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled || isViewCourses}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full ${isChecked ? 'bg-blue-600' : 'bg-gray-300'
            } ${(disabled || isViewCourses) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isChecked ? 'transform translate-x-4' : ''
            }`}
        ></div>
      </div>
    </div>
  );
}

export default PermissionToggle;
