"use client";

import { useEffect, useState } from 'react';

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        // Default breakpoint for mobile is 768px
        setIsMobile(window.innerWidth < 768);
      };
      
      // Set the initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
    
    return undefined;
  }, []);

  return isMobile;
}

export default useMobile;