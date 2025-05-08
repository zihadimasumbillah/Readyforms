"use client";

import { useEffect, useState } from "react";

// This hook helps prevent hydration errors by only rendering
// client-side components when the component has mounted
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}

// Export with alternative name for consistency with other code
export const useMounted = useHasMounted;