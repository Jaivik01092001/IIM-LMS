import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useSmoothScroll } from '../../context/SmoothScrollContext';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { lenis } = useSmoothScroll();

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Check initial scroll position

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top handler
  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: false, duration: 1.2 });
    } else {
      // Fallback to native scrolling if lenis is not available
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTopButton;
