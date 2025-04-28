import React from 'react';

/**
 * LoadingSpinner component - A reusable loading spinner
 * 
 * @param {Object} props
 * @param {string} [props.size='medium'] - Size of the spinner: 'small', 'medium', or 'large'
 * @param {string} [props.message='Loading...'] - Optional message to display below the spinner
 * @param {boolean} [props.overlay=false] - Whether to show the spinner as an overlay
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  overlay = false,
  className = ''
}) => {
  // Determine spinner size
  const spinnerSizeClass = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  }[size] || 'w-12 h-12 border-3';

  // Base spinner component
  const spinner = (
    <div className={`relative ${className}`}>
      <div 
        className={`${spinnerSizeClass} rounded-full border-gray-200 border-t-primary-color animate-spin mx-auto`}
      ></div>
      {message && <p className="mt-3 text-center text-gray-600">{message}</p>}
    </div>
  );

  // If overlay is true, wrap the spinner in an overlay container
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-50">
        {spinner}
      </div>
    );
  }

  // Otherwise, return just the spinner
  return (
    <div className="flex justify-center items-center py-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
