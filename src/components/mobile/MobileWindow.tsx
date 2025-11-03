"use client";

import type { AppId } from "@/types/window";

interface MobileWindowProps {
  appId: AppId;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function MobileWindow({
  appId,
  title,
  children,
  onClose,
}: MobileWindowProps) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h1 className="text-xl font-bold tracking-wide text-white uppercase">
          {title}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors hover:bg-red-600"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
