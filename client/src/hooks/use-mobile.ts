"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the current device has a mobile screen size
 * @param breakpoint The width threshold in pixels to consider as mobile (default: 768)
 * @returns Boolean indicating if the device is considered mobile
 */
export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Initial check
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Only run client-side
    if (typeof window !== "undefined") {
      checkIfMobile();
      
      // Add resize event listener
      window.addEventListener("resize", checkIfMobile);
      
      // Clean up event listener on unmount
      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, [breakpoint]);
  
  return isMobile;
};