"use client";

import { useWindowTheme } from "@/contexts/WindowThemeContext";
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
  const { getTheme } = useWindowTheme();
  const theme = getTheme(appId);

  return (
    <div
      className="flex h-full flex-col bg-slate-950 text-slate-100"
      style={
        theme
          ? ({
              "--theme_primary_color": theme.primary,
              "--theme_secondary_color": theme.secondary,
              "--theme_text_color": theme.text,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Window Header */}
      <div
        className={`border-theme-primary flex items-center justify-between border-b px-4 py-2 ${
          theme ? "bg-theme-secondary" : "bg-slate-900/95 text-slate-100"
        }`}
      >
        <h1
          className={`text-xl font-bold tracking-wide uppercase ${
            theme ? "text-theme-text" : "text-slate-100"
          }`}
        >
          {title}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className={`flex h-8 w-8 items-center justify-center rounded-sm border transition-colors hover:bg-red-600 hover:text-white ${
            theme
              ? "text-theme-text border-white/15"
              : "border-white/12 text-slate-100"
          }`}
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
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
