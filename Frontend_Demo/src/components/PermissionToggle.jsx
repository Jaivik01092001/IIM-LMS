import { useState, useEffect } from 'react';
import { formatPermissionName } from '../utils/permissions';

/**
 * Toggle switch component for permissions
 */
function PermissionToggle({ permission, value, onChange, disabled = false }) {
  const [isChecked, setIsChecked] = useState(value || false);
  
  // Update local state when value prop changes
  useEffect(() => {
    setIsChecked(value || false);
  }, [value]);
  
  // Handle toggle change
  const handleChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(permission, newValue);
  };
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <label htmlFor={`toggle-${permission}`} className="text-sm font-medium text-gray-700 cursor-pointer">
        {formatPermissionName(permission)}
      </label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none">
        <input
          type="checkbox"
          id={`toggle-${permission}`}
          name={`toggle-${permission}`}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full ${
            isChecked ? 'bg-blue-600' : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
            isChecked ? 'transform translate-x-4' : ''
          }`}
        ></div>
      </div>
    </div>
  );
}

export default PermissionToggle;
