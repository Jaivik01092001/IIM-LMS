import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';

// Create context
const SmoothScrollContext = createContext({
  lenis: null,
});

// Create provider
export const SmoothScrollProvider = ({ children }) => {
  const [lenis, setLenis] = useState(null);
  const requestRef = useRef();

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Store the lenis instance in state
    setLenis(lenisInstance);

    // Set up RAF loop for Lenis
    function raf(time) {
      lenisInstance.raf(time);
      requestRef.current = requestAnimationFrame(raf);
    }

    requestRef.current = requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      cancelAnimationFrame(requestRef.current);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

// Custom hook to use the smooth scroll context
export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (context === undefined) {
    throw new Error('useSmoothScroll must be used within a SmoothScrollProvider');
  }
  return context;
};
