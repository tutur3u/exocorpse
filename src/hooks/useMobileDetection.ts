"use client";

import { MOBILE_BREAKPOINT } from "@/constants";
import { useEffect, useState } from "react";

/**
 * Hook to detect if the current viewport is mobile (≤640px)
 * Handles SSR safely by returning false initially
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Handler for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}
