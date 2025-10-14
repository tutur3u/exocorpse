"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "exocorpse-desktop-notice-dismissed";

export default function DesktopNoticeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isVisible) return null;

  return (
    <div className="animate-slideDown fixed top-0 right-0 left-0 z-[9999]">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            💻 For the best experience, visit on desktop
          </p>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
            aria-label="Dismiss notice"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
