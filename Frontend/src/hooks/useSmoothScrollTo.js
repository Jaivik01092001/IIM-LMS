import { useCallback } from 'react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

/**
 * Custom hook to scroll to a specific element smoothly
 * @returns {Function} scrollTo - Function to scroll to an element
 */
export const useSmoothScrollTo = () => {
  const { lenis } = useSmoothScroll();

  /**
   * Scroll to a specific element
   * @param {string|HTMLElement} target - The target element or selector
   * @param {Object} options - Scroll options
   * @param {number} options.offset - Offset from the top of the element
   * @param {number} options.duration - Duration of the scroll animation
   * @param {boolean} options.immediate - Whether to scroll immediately without animation
   */
  const scrollTo = useCallback((target, options = {}) => {
    if (!lenis) {
      // Fallback to native scrolling if lenis is not available
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: options.immediate ? 'auto' : 'smooth' });
      }
      return;
    }

    const { offset = 0, duration, immediate = false } = options;

    // If target is a number (like 0 for top), scroll to that position
    if (typeof target === 'number') {
      lenis.scrollTo(target, {
        offset,
        duration,
        immediate,
      });
      return;
    }

    // If target is a string (selector), find the element
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (element) {
      lenis.scrollTo(element, {
        offset,
        duration,
        immediate,
      });
    }
  }, [lenis]);

  return scrollTo;
};

export default useSmoothScrollTo;
