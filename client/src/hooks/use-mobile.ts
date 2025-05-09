"use client";

import { useState, useEffect } from "react";

/**
 * @param breakpoint The width threshold in pixels to consider as mobile (default: 768)
 * @returns Boolean indicating if the device is considered mobile
 */
export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    if (typeof window !== "undefined") {
      checkIfMobile();
      window.addEventListener("resize", checkIfMobile);
      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, [breakpoint]);
  
  return isMobile;
};