import React from 'react';
import PropTypes from 'prop-types';
import './ProgressBar.css';

/**
 * ProgressBar component - A reusable progress bar that displays completion percentage
 *
 * @param {Object} props
 * @param {number} props.percentage - The percentage value (0-100)
 * @param {string} [props.size='medium'] - Size of the progress bar: 'small', 'medium', or 'large'
 * @param {string} [props.color='primary'] - Color theme: 'primary', 'success', 'warning', 'danger', or 'info'
 * @param {boolean} [props.showText=true] - Whether to show the percentage text
 * @param {string} [props.textPosition='right'] - Position of the text: 'right', 'inside', or 'none'
 * @param {boolean} [props.animated=false] - Whether to show animation effect
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The progress bar component
 */
const ProgressBar = ({
  percentage = 0,
  size = 'medium',
  color = 'primary',
  showText = true,
  textPosition = 'right',
  animated = false,
  className = ''
}) => {
  // Validate percentage (ensure it's between 0-100)
  const validPercentage = Math.min(Math.max(0, percentage), 100);

  // Determine height based on size
  const heightClass = {
    small: 'h-1.5',
    medium: 'h-2.5',
    large: 'h-4'
  }[size] || 'h-2.5';

  // Determine color based on theme
  const colorClass = {
    primary: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-indigo-500'
  }[color] || 'bg-blue-600';

  // Animation class
  const animationClass = animated ? 'transition-all duration-500 ease-out' : '';

  // Text size based on progress bar size
  const textSizeClass = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }[size] || 'text-sm';

  return (
    <div className={`progress-bar-component flex items-center gap-3 ${className}`}>
      <div className={`progress-bar-bg w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`progress-bar-fill ${colorClass} ${heightClass} rounded-full ${animationClass}`}
          style={{ width: `${validPercentage}%` }}
        >
          {textPosition === 'inside' && showText && validPercentage > 10 && (
            <div className="progress-bar-text-inside h-full flex items-center justify-end pr-2">
              <span className="text-white text-xs font-medium">{validPercentage}%</span>
            </div>
          )}
        </div>
      </div>

      {textPosition === 'right' && showText && (
        <span className={`progress-bar-text ${textSizeClass} font-medium text-gray-700 min-w-[42px] text-right`}>
          {validPercentage}%
        </span>
      )}
    </div>
  );
};

ProgressBar.propTypes = {
  percentage: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  showText: PropTypes.bool,
  textPosition: PropTypes.oneOf(['right', 'inside', 'none']),
  animated: PropTypes.bool,
  className: PropTypes.string
};

export default ProgressBar;
